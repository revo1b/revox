-- ============================================================
-- REVOX — Sample seed data
-- Run this AFTER schema.sql, in the Supabase SQL Editor.
-- Safe to skip if you'd rather start empty.
-- ============================================================

insert into business_profile (business_name, industry, description, services) values
('Msemakweli Wellness', 'Health & Wellness', 'Wellness and diet coaching business.', 'Diet coaching, wellness programs, health consulting');

with co as (
  insert into companies (name, industry, website, phone, relationship_health, ai_summary) values
  ('ABC Hospital', 'Healthcare', 'abchospital.co.tz', '+255 22 000 0001', 'healthy',
   'ABC Hospital is currently evaluating two equipment opportunities. Engagement has increased over the last seven days, but the largest opportunity is waiting for procurement approval.'),
  ('XYZ Medical', 'Healthcare', 'xyzmedical.co.tz', '+255 22 000 0002', 'at_risk',
   'XYZ Medical has gone quiet after an initial strong interest. No response in over a week.'),
  ('Sarah Mwangi Consulting', 'Consulting', null, '+255 76 000 0003', 'neutral',
   'Independent consultant evaluating a wellness proposal for her client base.')
  returning id, name
)
select * into temp co_map from co;

with c as (
  insert into contacts (company_id, name, position, email, phone, status, ai_score, tags, ai_summary, last_activity_at)
  select
    (select id from co_map where name = v.company_name),
    v.name, v.position, v.email, v.phone, v.status, v.ai_score, v.tags, v.ai_summary, v.last_activity_at
  from (values
    ('ABC Hospital', 'John Michael', 'Procurement Manager', 'john.michael@abchospital.co.tz', '+255 754 000 001', 'prospect', 92, 'hot,high-value',
     'John is evaluating three equipment solutions. He requested a revised quotation and appears highly interested.', now()),
    ('XYZ Medical', 'Grace Kileo', 'Operations Director', 'grace.kileo@xyzmedical.co.tz', '+255 754 000 002', 'lead', 58, 'follow-up',
     'Grace requested pricing two weeks ago; engagement has since slowed.', now() - interval '9 days'),
    ('Sarah Mwangi Consulting', 'Sarah Mwangi', 'Principal Consultant', 'sarah@mwangiconsulting.co.tz', '+255 754 000 003', 'prospect', 74, 'proposal-sent',
     'Sarah received a proposal and has not responded in four days.', now() - interval '4 days')
  ) as v(company_name, name, position, email, phone, status, ai_score, tags, ai_summary, last_activity_at)
  returning id, name
)
select * into temp c_map from c;

insert into contacts (company_id, name, position, email, phone, status, ai_score, tags, ai_summary, last_activity_at) values
(null, 'Peter Nyerere', 'Owner', 'peter@ntgym.co.tz', '+255 754 000 004', 'customer', 88, 'customer,recurring',
 'Long-standing customer, renews coaching package quarterly.', now() - interval '1 day');

with o as (
  insert into opportunities (title, contact_id, company_id, value, stage, probability, expected_close, next_best_action, next_best_action_reason, ai_summary, last_activity_at)
  select
    v.title,
    (select id from c_map where name = v.contact_name),
    (select id from co_map where name = v.company_name),
    v.value, v.stage, v.probability, v.expected_close, v.next_best_action, v.next_best_action_reason, v.ai_summary, v.last_activity_at
  from (values
    ('Hospital Equipment Package', 'John Michael', 'ABC Hospital', 48500000, 'negotiation', 70, (current_date + 14),
     'Send the revised proposal to ABC Hospital today.',
     'Customer requested revision; deal is in negotiation; opportunity value is high; customer recently engaged.',
     'Negotiation stage, revised quotation requested, decision expected within two weeks.', now()),
    ('Wellness Program Rollout', 'Sarah Mwangi', 'Sarah Mwangi Consulting', 12500000, 'proposal', 45, (current_date + 21),
     'Follow up with Sarah Mwangi today.',
     'Proposal sent four days ago with no response; opportunity is warm.',
     'Proposal under review; awaiting response.', now() - interval '4 days'),
    ('Diagnostic Equipment Deal', 'Grace Kileo', 'XYZ Medical', 21000000, 'qualified', 30, (current_date + 30),
     'Reconnect with the decision maker at XYZ Medical.',
     'Opportunity has been inactive for nine days; risk of stalling.',
     'Qualified but inactive; needs re-engagement.', now() - interval '9 days')
  ) as v(title, contact_name, company_name, value, stage, probability, expected_close, next_best_action, next_best_action_reason, ai_summary, last_activity_at)
  returning id, title
)
select * into temp o_map from o;

with t as (
  insert into email_threads (subject, contact_id, company_id, opportunity_id, folder, is_unread, is_important, ai_intent, ai_priority, ai_sentiment, ai_recommended_action, waiting_since, last_message_at)
  select
    v.subject,
    (select id from c_map where name = v.contact_name),
    (select id from co_map where name = v.company_name),
    (select id from o_map where title = v.opp_title),
    v.folder, v.is_unread, v.is_important, v.ai_intent, v.ai_priority, v.ai_sentiment, v.ai_recommended_action, v.waiting_since, v.last_message_at
  from (values
    ('Updated quotation', 'John Michael', 'ABC Hospital', 'Hospital Equipment Package', 'inbox', true, true, 'Purchase negotiation', 'high', 'Positive',
     'Send revised quotation.', null::timestamptz, now()),
    ('Re: Equipment proposal', 'Sarah Mwangi', 'Sarah Mwangi Consulting', 'Wellness Program Rollout', 'waiting', false, true, 'Awaiting decision', 'medium', 'Neutral',
     'Follow up today.', now() - interval '4 days', now() - interval '4 days'),
    ('Meeting confirmation', 'Grace Kileo', 'XYZ Medical', 'Diagnostic Equipment Deal', 'inbox', false, false, 'Scheduling', 'low', 'Neutral',
     'Confirm meeting time.', null::timestamptz, now() - interval '1 day')
  ) as v(subject, contact_name, company_name, opp_title, folder, is_unread, is_important, ai_intent, ai_priority, ai_sentiment, ai_recommended_action, waiting_since, last_message_at)
  returning id, subject
)
select * into temp t_map from t;

insert into emails (thread_id, direction, sender_name, sender_email, body, sent_at)
select (select id from t_map where subject = v.subject), v.direction, v.sender_name, v.sender_email, v.body, v.sent_at
from (values
  ('Updated quotation', 'inbound', 'John Michael', 'john.michael@abchospital.co.tz',
   'Hello, thank you for the initial quotation. Could you please revise the pricing for the extended warranty option and resend? We would like to finalize this week.', now()),
  ('Re: Equipment proposal', 'outbound', 'Revocatus Benedicto', 'ben@msemakweli.com',
   'Hi Sarah, following up on the wellness program proposal I sent over. Happy to jump on a call if useful — let me know what works.', now() - interval '4 days'),
  ('Meeting confirmation', 'inbound', 'Grace Kileo', 'grace.kileo@xyzmedical.co.tz',
   'Can we confirm the meeting for next Tuesday at 10am to go through the diagnostic equipment specs?', now() - interval '1 day')
) as v(subject, direction, sender_name, sender_email, body, sent_at);

insert into activities (contact_id, company_id, opportunity_id, type, description, occurred_at)
select (select id from c_map where name='John Michael'), (select id from co_map where name='ABC Hospital'), (select id from o_map where title='Hospital Equipment Package'),
  'email', 'Email received from ABC Hospital — Updated quotation', now();

insert into activities (type, description, occurred_at)
select 'task', 'Task completed — renew coaching package', now() - interval '2 hours';

insert into activities (contact_id, company_id, opportunity_id, type, description, occurred_at)
select (select id from c_map where name='Grace Kileo'), (select id from co_map where name='XYZ Medical'), (select id from o_map where title='Diagnostic Equipment Deal'),
  'opportunity_update', 'Opportunity moved to Qualified', now() - interval '9 days';

insert into tasks (title, description, due_date, priority, status, contact_id, company_id, opportunity_id)
select 'Send revised quotation to ABC Hospital', 'Include updated extended warranty pricing.', current_date, 'high', 'open',
  (select id from c_map where name='John Michael'), (select id from co_map where name='ABC Hospital'), (select id from o_map where title='Hospital Equipment Package');

insert into tasks (title, description, due_date, priority, status, contact_id, company_id, opportunity_id)
select 'Follow up with Sarah Mwangi', 'No response for 4 days on wellness proposal.', current_date, 'high', 'open',
  (select id from c_map where name='Sarah Mwangi'), (select id from co_map where name='Sarah Mwangi Consulting'), (select id from o_map where title='Wellness Program Rollout');

insert into tasks (title, description, due_date, priority, status, contact_id, company_id, opportunity_id)
select 'Prepare diagnostic equipment spec sheet', 'For meeting with Grace Kileo.', current_date + 1, 'medium', 'open',
  (select id from c_map where name='Grace Kileo'), (select id from co_map where name='XYZ Medical'), (select id from o_map where title='Diagnostic Equipment Deal');

insert into tasks (title, description, due_date, priority, status)
values ('Renew coaching package — Peter Nyerere', 'Quarterly renewal call.', current_date - 1, 'low', 'completed');

insert into appointments (title, starts_at, ends_at, contact_id, company_id, opportunity_id, ai_preparation)
select 'ABC Hospital Meeting', now() + interval '2 days', now() + interval '2 days' + interval '1 hour',
  (select id from c_map where name='John Michael'), (select id from co_map where name='ABC Hospital'), (select id from o_map where title='Hospital Equipment Package'),
  'Customer requested revised quotation. Decision expected this week.';

insert into appointments (title, starts_at, ends_at, contact_id, company_id, opportunity_id, ai_preparation)
select 'XYZ Medical Spec Review', now() + interval '1 day', now() + interval '1 day' + interval '1 hour',
  (select id from c_map where name='Grace Kileo'), (select id from co_map where name='XYZ Medical'), (select id from o_map where title='Diagnostic Equipment Deal'),
  'Bring diagnostic equipment spec sheet and pricing options.';

insert into notifications (type, message, link, is_read) values
('email', 'New important email from ABC Hospital', '/email', false),
('task', 'Task overdue: Renew coaching package — Peter Nyerere', '/tasks', true),
('lead', 'New lead created — Grace Kileo', '/contacts', true);

insert into knowledge_sources (title, type, content) values
('Business Profile', 'profile', 'Msemakweli Wellness provides diet coaching and wellness programs for individuals and organizations in Tanzania.'),
('Sales Process Guidelines', 'sales', 'Standard sales process: Lead -> Contacted -> Qualified -> Proposal -> Negotiation -> Won/Lost. Always confirm budget before sending a formal proposal.');
