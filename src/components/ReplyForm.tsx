'use client';

import { Send } from 'lucide-react';
import { replyOrComposeEmail } from '@/lib/actions/email';

export function ReplyForm({ threadId }: { threadId: string }) {
  return (
    <form action={replyOrComposeEmail}>
      <input type="hidden" name="thread_id" value={threadId} />
      <textarea
        name="body"
        rows={4}
        placeholder="Write a reply…"
        required
        className="w-full border border-border-strong rounded-lg p-3 text-[13.5px]"
      />
      <div className="flex justify-end gap-2.5 mt-3">
        <button type="submit" name="action" value="draft" className="btn">Save Draft</button>
        <button type="submit" name="action" value="send" className="btn btn-primary">
          <Send size={14} strokeWidth={1.7} /> Review &amp; Send
        </button>
      </div>
    </form>
  );
}
