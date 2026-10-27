-- Non-persistent integration fixture. Everything, including synthetic users,
-- is rolled back; this tests SQL policies/projection, not email authentication.
begin;
create temp table qa_players as select gen_random_uuid() a,gen_random_uuid() b;
grant select on qa_players to authenticated;
insert into auth.users(id) select a from qa_players union all select b from qa_players;
select set_config('request.jwt.claim.sub',(select a::text from qa_players),true);
set local role authenticated;
insert into public.player_progress(user_id,save_version,revision,snapshot)
values(auth.uid(),1,1,'{"version":1,"save":{},"record":{"version":1,"identity":{"displayName":"QA owner A","avatar":"gunner"},"stats":{"started":1,"runs":1,"wins":0,"losses":1,"highestCompletedWave":2,"kills":12},"history":[],"achievements":[]}}');
select set_config('request.jwt.claim.sub',(select b::text from qa_players),true);
insert into public.player_progress(user_id,save_version,revision,snapshot)
values(auth.uid(),1,1,'{"version":1,"save":{},"record":{"version":1,"identity":{"displayName":"QA owner B","avatar":"fire"},"stats":{"started":0,"runs":0,"wins":0,"losses":0,"highestCompletedWave":0,"kills":0},"history":[],"achievements":[]}}');
select set_config('request.jwt.claim.sub',(select a::text from qa_players),true);
do $$
declare foreign_id uuid; affected int;
begin
 select b into foreign_id from qa_players;
 if (select count(*) from public.player_progress)<>1 then raise exception 'Cross-owner progress read';end if;
 if (select count(*) from public.player_profiles)<>1 then raise exception 'Cross-owner profile read';end if;
 if (select count(*) from public.player_stats where total_enemies_defeated=12)<>1 then raise exception 'Projection stats missing';end if;
 if (select count(*) from public.player_unlocks)<>4 then raise exception 'Projection unlocks missing or leaked';end if;
 update public.player_progress set revision=99 where user_id=foreign_id;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'Cross-owner update allowed';end if;
 begin
  insert into public.player_achievements(user_id,achievement_id) values(foreign_id,'foreign-write');
  raise exception 'Cross-owner insert allowed';
 exception when insufficient_privilege then null;end;
 begin
  update public.player_progress set user_id=foreign_id where user_id=auth.uid();
  raise exception 'Owner reassignment allowed';
 exception when insufficient_privilege then null;when unique_violation then null;end;
end;
$$;
rollback;
select 'PASS rolled-back live owner projection/read/write isolation checks' as result;
