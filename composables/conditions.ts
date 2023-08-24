import {Condition, HasConditions} from "~/composables/project";
import {match} from "ts-pattern";
import * as R from "ramda";

type ConditionEval = (selected: string[]) => boolean;

export const checkConditions = (item: HasConditions & { id: string; }, selected: string[]) => {
  const condition = buildRootCondition(item.requireds);
  let result = condition(selected);
  console.log(`check(${item.id}) with ${selected} => ${result}`);
  return result;
}

const buildRootCondition = (terms: Condition[]): ConditionEval => {
  if (terms.length === 0)
    return ALWAYS;
  else
    return R.allPass(R.map(buildCondition, terms));
}
/* [
{"afterText":"choice","beforeText":"Required:","id":"","operator":"",
 "orRequired":[{"req":"fqch"},{"req":"jfl2"}],"reqId":"","reqId1":"","reqId2":"","reqId3":"","reqPoints":0,"required":true,
 "requireds":[],"showRequired":false,"type":"or"},
 {"afterText":"","beforeText":"Required:","id":"","operator":"","orRequired":[{"req":""},{"req":""},{"req":""},{"req":""}],"reqId":"cjqy","reqId1":"","reqId2":"","reqId3":"","reqPoints":0,"required":true,"requireds":[],"showRequired":false,"type":"id"}] */
const buildCondition = (term: Condition): ConditionEval => {
  return match(term)
    .with({ type: 'id', required: true }, () => {
      const ids = R.filter(R.isNotNil, [term.reqId, term.reqId1, term.reqId2, term.reqId3]);
      if (ids.length === 0) return ALWAYS;
      else if (ids.length === 1) return SELECTED(ids[0]);
      else return R.allPass(R.map(SELECTED, ids));
    })
    .otherwise(() => NEVER)
}

const ALWAYS: ConditionEval = () => true;
const NEVER: ConditionEval = () => false;
const SELECTED = (id: string): ConditionEval => R.includes(id)
