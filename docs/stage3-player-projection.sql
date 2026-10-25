-- Applied through Supabase MCP; its migration ledger is authoritative.
-- Casual self-owned progress only. These client-submitted records are not scores
-- for competitive rewards, rankings, payments or any trusted entitlement.
create or replace function public.project_player_snapshot()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
 r jsonb := new.snapshot->'record';
 s jsonb := r->'stats';
 item jsonb;
 item_key text;
 item_value jsonb;
begin
 if auth.uid() is null or auth.uid() <> new.user_id then
  raise exception 'Owner required' using errcode='42501';
 end if;
 if new.save_version <> 1 or new.snapshot->>'version' <> '1'
    or r->>'version' <> '1' or jsonb_typeof(new.snapshot->'save') <> 'object'
    or jsonb_typeof(s) <> 'object' then
  raise exception 'Unsupported player snapshot' using errcode='22023';
 end if;
 insert into public.player_profiles(user_id,display_name,avatar_kind,avatar_hero_id)
 values(new.user_id,r->'identity'->>'displayName','hero',r->'identity'->>'avatar')
 on conflict(user_id) do update set display_name=excluded.display_name,
 avatar_hero_id=excluded.avatar_hero_id,updated_at=now();
 insert into public.player_stats(user_id,runs_started,runs_completed,wins,losses,highest_wave,total_enemies_defeated)
 values(new.user_id,(s->>'started')::int,(s->>'runs')::int,(s->>'wins')::int,
 (s->>'losses')::int,(s->>'highestCompletedWave')::int,(s->>'kills')::bigint)
 on conflict(user_id) do update set runs_started=excluded.runs_started,
 runs_completed=excluded.runs_completed,wins=excluded.wins,losses=excluded.losses,
 highest_wave=excluded.highest_wave,total_enemies_defeated=excluded.total_enemies_defeated,updated_at=now();
 for item in select value from jsonb_array_elements(coalesce(r->'history','[]'::jsonb)) loop
  insert into public.game_runs(id,user_id,finished_at,outcome,max_wave,leader_id,game_version,run_summary)
  values((item->>'id')::uuid,new.user_id,(item->>'at')::timestamptz,
  case when item->>'outcome'='retired' then 'abandoned' else item->>'outcome' end,
  (item->>'completedWave')::int,item->'heroes'->>0,'stage3',item)
  on conflict(id) do nothing;
 end loop;
 for item in select value from jsonb_array_elements(coalesce(r->'achievements','[]'::jsonb)) loop
  insert into public.player_achievements(user_id,achievement_id,unlocked_at)
  values(new.user_id,item->>'id',(item->>'at')::timestamptz)
  on conflict(user_id,achievement_id) do nothing;
 end loop;
 for item_key in select unnest(array['gunner','fire','electric','frost']) loop
  insert into public.player_unlocks(user_id,item_type,item_id) values(new.user_id,'hero',item_key)
  on conflict(user_id,item_type,item_id) do nothing;
 end loop;
 for item_key,item_value in select key,value from jsonb_each(coalesce(new.snapshot->'save'->'collection'->'heroes','{}'::jsonb)) loop
  if item_value->>'unlocked'='true' then
   insert into public.player_unlocks(user_id,item_type,item_id) values(new.user_id,'hero',item_key)
   on conflict(user_id,item_type,item_id) do nothing;
  end if;
 end loop;
 for item_key,item_value in select key,value from jsonb_each(coalesce(new.snapshot->'save'->'collection'->'spells','{}'::jsonb)) loop
  if item_value->>'unlocked'='true' then
   insert into public.player_unlocks(user_id,item_type,item_id) values(new.user_id,'spell',item_key)
   on conflict(user_id,item_type,item_id) do nothing;
  end if;
 end loop;
 return new;
end;
$$;
revoke all on function public.project_player_snapshot() from public,anon;
grant execute on function public.project_player_snapshot() to authenticated;
create trigger project_player_snapshot_after_write
after insert or update of snapshot on public.player_progress
for each row execute function public.project_player_snapshot();
