import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildBusinessContext, localAiReply } from '@/lib/ai/localEngine';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ reply: 'Please sign in to use AI Brain.' }, { status: 401 });
  }

  const { message } = await request.json();
  const question = String(message || '').trim();

  if (!question) {
    return NextResponse.json({ reply: 'Please type a question about your business.' });
  }

  // Persist the conversation
  let { data: conversation } = await supabase
    .from('ai_conversations')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!conversation) {
    const { data: created } = await supabase.from('ai_conversations').insert({ title: 'Business chat' }).select('id').single();
    conversation = created;
  }

  if (conversation) {
    await supabase.from('ai_messages').insert({ conversation_id: conversation.id, role: 'user', content: question });
  }

  let reply: string | null = null;

  // If a live API key is configured, call Anthropic's API with grounded CRM context.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) {
    try {
      const context = await buildBusinessContext();
      const systemPrompt =
        'You are Revox, an intelligent business chief-of-staff. Answer ONLY using the business context provided below. ' +
        "Never invent data. If the answer isn't in the context, say you don't have enough information. Be concise and structured.\n\n" +
        `BUSINESS CONTEXT:\n${context}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 700,
          system: systemPrompt,
          messages: [{ role: 'user', content: question }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.content?.[0]?.text) {
          reply = data.content[0].text;
        }
      }
    } catch {
      // Fall through to local engine below.
    }
  }

  if (reply === null) {
    reply = await localAiReply(question);
  }

  if (conversation) {
    await supabase.from('ai_messages').insert({ conversation_id: conversation.id, role: 'assistant', content: reply });
  }

  return NextResponse.json({ reply });
}
