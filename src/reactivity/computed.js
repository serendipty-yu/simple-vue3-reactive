import {isFunction} from "../shared/utils";
import {effect, track, trigger} from "./effect";
import {TrackOpTypes, TriggerOpType} from "./operation";

export function computed(getterOptions) {
    let getter
    let setter

    if(isFunction(getterOptions)) {
        getter = getterOptions
        setter = () => {}
    } else {
        getter = getterOptions.get
        setter = getterOptions.set
    }
    let dirty = true

    let computed

    let runner = effect(getter, {
        lazy: true,
        computed: true,
        scheduler: () => {
            if(!dirty) {
                dirty = true
                trigger(computed,TriggerOpType.SET,'value')
            }
        }
    })

    let value
    computed = {
        get value() {
            if(dirty) {
                value = runner()
                dirty = false
                track(computed,TrackOpTypes.GET,'value')
            }
            return value
        },
        set value(newValue) {
            setter(newValue)
        }
    }
    return computed
}
