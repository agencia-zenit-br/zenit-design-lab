import { test } from 'node:test';
import {resolveZonedDateTime,zonedInstantFields} from '../src/temporal/zonedClock.ts';
import assert from 'node:assert/strict';
import {
 validateCivilDate,parseCivilDate,localeDateOrder,formatEditableCivilDate,civilDayDifference,
 dateRangeMetrics,normalizeMultiDates,parseTimeOfDay,formatEditableTime,timeRangeDuration,
 secondsToDuration,parseTimerDuration,instantIntervalDuration,parseExplicitInstant,countdownSnapshot,makeTimer,timerSnapshot,
 startTimer,pauseTimer,resetTimer,
} from '../src/temporal/core.ts';

const value=result=>{assert.equal(result.ok,true,JSON.stringify(result));return result.value};
const error=result=>{assert.equal(result.ok,false,JSON.stringify(result));return result.error};
test('Civil day arithmetic is independent of timezone and leap-year boundaries',()=>{
 assert.equal(value(validateCivilDate('2024-02-29')),'2024-02-29');
 assert.ok(error(validateCivilDate('2025-02-29')));
 assert.ok(error(validateCivilDate('2026-13-01')));
 assert.ok(error(validateCivilDate('2026-02-30')));
 assert.ok(error(validateCivilDate('24-01-05')));
 assert.deepEqual(value(dateRangeMetrics('2026-11-10','2026-11-15')),
   {elapsedDays:5,inclusiveDays:6,nights:5});
 assert.deepEqual(value(dateRangeMetrics('2026-11-10','2026-11-10')),
   {elapsedDays:0,inclusiveDays:1,nights:0});
 assert.equal(value(civilDayDifference('2024-02-28','2024-03-01')),2);
 assert.equal(value(civilDayDifference('2026-12-31','2027-01-01')),1);
 assert.ok(error(civilDayDifference('2026-11-15','2026-11-10')));
});
test('Explicit regional numeric parsing never uses platform Date.parse heuristics',()=>{
 assert.equal(localeDateOrder('es-ES'),'DMY');
 assert.equal(localeDateOrder('en-US'),'MDY');
 assert.equal(value(parseCivilDate('15/11/2026','es-ES')),'2026-11-15');
 assert.equal(value(parseCivilDate('11/15/2026','en-US')),'2026-11-15');
 assert.equal(value(parseCivilDate('2026-11-15','en-US')),'2026-11-15');
 assert.equal(formatEditableCivilDate('2026-11-15','es-ES'),'15/11/2026');
 assert.equal(formatEditableCivilDate('2026-11-15','en-US'),'11/15/2026');
 assert.ok(error(parseCivilDate('04/13/2026','es-ES')));
 assert.ok(error(parseCivilDate('2026-02-30','es-ES')));
 assert.ok(error(parseCivilDate('15/11/26','es-ES')));
});
test('Independent, unique non-contiguous selections',()=>{
 assert.deepEqual(value(normalizeMultiDates(['2026-11-15','2026-11-10','2026-11-15'])),['2026-11-10','2026-11-15']);
 assert.ok(error(normalizeMultiDates(['2026-11-10','2026-02-30'])));
});
test('12/24-hour entry, optional seconds and strict limits',()=>{
 assert.deepEqual(value(parseTimeOfDay('2:30 PM','h12')),{hour:14,minute:30,second:0});
 assert.deepEqual(value(parseTimeOfDay('12:00 AM','h12')),{hour:0,minute:0,second:0});
 assert.deepEqual(value(parseTimeOfDay('12:45 PM','h12')),{hour:12,minute:45,second:0});
 assert.deepEqual(value(parseTimeOfDay('23:59:59','h23')),{hour:23,minute:59,second:59});
 assert.deepEqual(value(parseTimeOfDay('2000','h23')),{hour:20,minute:0,second:0});
 assert.deepEqual(value(parseTimeOfDay('930','h23')),{hour:9,minute:30,second:0});
 assert.deepEqual(value(parseTimeOfDay('0930','h23')),{hour:9,minute:30,second:0});
 assert.deepEqual(value(parseTimeOfDay('230 PM','h12')),{hour:14,minute:30,second:0});
 assert.equal(formatEditableTime({hour:14,minute:30,second:45},'h12',true),'02:30:45 PM');
 assert.equal(formatEditableTime({hour:14,minute:30,second:45},'h23',false),'14:30');
 assert.ok(error(parseTimeOfDay('14:30 PM','h12')));
 assert.ok(error(parseTimeOfDay('12:30','h12')));
 assert.ok(error(parseTimeOfDay('2:30 PM','h23')));
 assert.ok(error(parseTimeOfDay('24:00','h23')));
 assert.ok(error(parseTimeOfDay('12:60','h23')));
 assert.ok(error(parseTimeOfDay('2460','h23')));
 assert.ok(error(parseTimeOfDay('2400','h23')));
 assert.ok(error(parseTimeOfDay('1260','h23')));
 assert.ok(error(parseTimeOfDay('930','h12')));
});
test('Time interval next-day policy and seconds-precise duration',()=>{
 const start={hour:22,minute:30,second:0},end={hour:2,minute:15,second:12};
 assert.ok(error(timeRangeDuration(start,end)));
 assert.deepEqual(value(timeRangeDuration(start,end,true)),
   {days:0,hours:3,minutes:45,seconds:12,totalSeconds:13512});
 assert.deepEqual(value(timeRangeDuration(end,end)),
   {days:0,hours:0,minutes:0,seconds:0,totalSeconds:0});
 assert.deepEqual(value(secondsToDuration(90061)),
   {days:1,hours:1,minutes:1,seconds:1,totalSeconds:90061});
});
test('Real offset-aware instants account for daylight saving, unlike civil days',()=>{
 // NYC spring-forward interval: 01:30 EST to 03:30 EDT = 1 elapsed hour.
 assert.equal(value(instantIntervalDuration('2026-03-08T01:30:00-05:00','2026-03-08T03:30:00-04:00')).totalSeconds,3600);
 assert.ok(error(instantIntervalDuration('2026-03-08T01:30:00','2026-03-08T03:30:00')));
 assert.ok(error(instantIntervalDuration('2026-03-08T04:00:00Z','2026-03-08T02:00:00Z')));
});
test('Explicit instant parsing rejects silent browser date normalization and invalid offsets',()=>{
 assert.ok(error(parseExplicitInstant('2026-02-30T12:00:00Z')));
 assert.ok(error(parseExplicitInstant('2026-11-15T24:01:00Z')));
 assert.ok(error(parseExplicitInstant('2026-11-15T12:61:00Z')));
 assert.ok(error(parseExplicitInstant('2026-11-15T12:01:99Z')));
 assert.ok(error(parseExplicitInstant('2026-11-15T12:01:00+24:00')));
 assert.ok(error(parseExplicitInstant('2026-11-15T12:01:00')));
 assert.equal(value(parseExplicitInstant('2026-11-15T12:01:00Z')),Date.UTC(2026,10,15,12,1));
});
test('Countdown recomputes using absolute target, including overdue and exact zero',()=>{
 const target=Date.UTC(2026,10,15,12,0,0);
 assert.equal(countdownSnapshot(target,target-90061_000).remaining.totalSeconds,90061);
 assert.equal(countdownSnapshot(target,target-500).remaining.totalSeconds,1);
 assert.deepEqual(countdownSnapshot(target,target),{
   state:'expired',remaining:{days:0,hours:0,minutes:0,seconds:0,totalSeconds:0}});
 assert.equal(countdownSnapshot(target,target+60000).state,'expired');
 assert.equal(countdownSnapshot(NaN,target).state,'invalid');
});
test('Structured timer units preserve strict upper bounds and no implicit rollover',()=>{
 assert.equal(value(parseTimerDuration({days:'0',hours:'1',minutes:'2',seconds:'3'})),3723);
 assert.equal(value(parseTimerDuration({days:'1',hours:'0',minutes:'0',seconds:'0'})),86400);
 assert.equal(value(parseTimerDuration({days:'365',hours:'0',minutes:'0',seconds:'0'})),31536000);
 assert.ok(error(parseTimerDuration({days:'0',hours:'0',minutes:'0',seconds:'0'})));
 assert.ok(error(parseTimerDuration({days:'0',hours:'24',minutes:'0',seconds:'0'})));
 assert.ok(error(parseTimerDuration({days:'0',hours:'0',minutes:'60',seconds:'0'})));
 assert.ok(error(parseTimerDuration({days:'0',hours:'0',minutes:'0',seconds:'60'})));
 assert.ok(error(parseTimerDuration({days:'365',hours:'0',minutes:'0',seconds:'1'})));
 assert.ok(error(parseTimerDuration({days:'a',hours:'0',minutes:'0',seconds:'1'})));
});
test('Timer runs, pauses, resumes, finishes and resets under injected virtual time',()=>{
 let timer=value(makeTimer(180));
 assert.equal(timerSnapshot(timer,0).state,'idle');
 timer=startTimer(timer,10_000);
 assert.equal(timerSnapshot(timer,40_000).remainingSeconds,150);
 timer=pauseTimer(timer,40_000);
 assert.equal(timerSnapshot(timer,120_000).remainingSeconds,150);
 assert.equal(timerSnapshot(timer,120_000).state,'paused');
 timer=startTimer(timer,120_000);
 assert.equal(timerSnapshot(timer,270_000).remainingSeconds,0);
 assert.equal(timerSnapshot(timer,270_000).state,'completed');
 timer=pauseTimer(timer,270_000);
 assert.equal(timer.state,'completed');
 timer=resetTimer(timer);
 assert.equal(timerSnapshot(timer,990_000).remainingSeconds,180);
 assert.equal(timerSnapshot(timer,990_000).state,'idle');
 assert.ok(error(makeTimer(0)));
 assert.ok(error(makeTimer(-3)));
});
console.log('PASS Zenit headless temporal core: civil, time, interval, countdown and timer semantics');

test('IANA wall-clock conversion accepts real local hours but rejects DST gaps and overlaps',()=>{
 const ordinary=resolveZonedDateTime('2026-03-08','03:30','America/New_York');
 assert.equal(value(ordinary),Date.parse('2026-03-08T07:30:00Z'));
 assert.equal(value(resolveZonedDateTime('2026-11-01','03:30','America/New_York')),
   Date.parse('2026-11-01T08:30:00Z'));
 assert.match(error(resolveZonedDateTime('2026-03-08','02:30','America/New_York')),/no existe/);
 assert.match(error(resolveZonedDateTime('2026-11-01','01:30','America/New_York')),/se repite/);
 const sao=value(resolveZonedDateTime('2026-11-15','14:30','America/Sao_Paulo'));
 assert.equal(sao,Date.parse('2026-11-15T17:30:00Z'));
 assert.deepEqual(value(zonedInstantFields(sao,'America/Sao_Paulo')),
   {date:'2026-11-15',time:'14:30',second:0});
 assert.match(error(resolveZonedDateTime('2026-02-30','14:30','UTC')),/no existe/);
 assert.match(error(resolveZonedDateTime('2026-11-15','25:30','UTC')),/hora válida/);
});
