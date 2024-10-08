<template>
    <section :class="sharedFunctions.prepareClasses()"
         v-if="sharedFunctions?.shouldBeConstructed(props.description.header)"
         v-show="!props.description.xHideValue"
         :id="props.description.id">

      <h1 class="title" v-if="props.description.header.title">
        {{ sharedFunctions.getTitle() }}
        <i class="icon icon-question-mark" v-if="sharedFunctions.getDescriptionText()"
           v-tooltip.bottom="sharedFunctions.getDescriptionText()"></i>
      </h1>

      <template v-for="(line, lineIndex) in vm.lines" v-show="!isAllLineHidden(line)">
          <div class="field-block">
            <template v-for="item in line">
                <template v-if="shouldItemBeConstructed(item)" v-tooltip.bottom="item.description.description">
                    <DynamicField v-if="item.blockComponent === BlockComponents.value"
                                    :description="item.description" :model="vm.model[item.description.name]"
                                    @modelChange="onModelChange(item.description.name, $event)"
                                    :context="vm.context">
                    </DynamicField>

                    <DynamicFieldBlock v-if="item.blockComponent !== BlockComponents.value"
                                  :description="item" :context="vm.context"
                                  :model="vm.model" @modelChange="onModelChange(null, $event)">
                    </DynamicFieldBlock>
                </template>
            </template>
          </div>
       </template>
    </section>
</template>

<script setup lang="ts">
import { onMounted, getCurrentInstance } from 'vue';
import type { BaseFieldEmits, BaseFieldProps } from '~/composables/schema-forms/useBaseField';
import useBaseField from '~/composables/schema-forms/useBaseField';
import { isObject } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import DynamicFieldBlock from '~/components/schema-forms/DynamicFieldBlock.vue';
import DynamicField from '~/components/schema-forms/DynamicField.vue';
import { BlockComponents } from '~/service/schema-forms/blockComponents';

// @ts-ignore
const props = defineProps<BaseFieldProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


let { vm, sharedFunctions } = useBaseField(props, emits);

const initFieldBase = sharedFunctions.initField;

vm = extend(vm, {
    lines: []
});

sharedFunctions.initField = initField;

function initField(): void {
    initFieldBase();

    if (!vm.model || !isObject(vm.model) || Array.isArray(vm.model)) {
        vm.model = {};
    }

    vm.lines = [[]];

    if (vm.model === undefined || vm.model === null) {
        if (props.description.header.required) {
            sharedFunctions.createModel();
        } else if (!props.description.header.xClose || props.description.header.xClose.default === false) {
            sharedFunctions.createModel();
        }
    }

    if (vm.model && !Object.keys(vm.model).length) {
        if (props.description.header.xClose && props.description.header.xClose.default === true) {
            sharedFunctions.deleteModel();
        }
    }

    props.description.content.forEach((item: any) => {
        const description = item.description;

        let lineNumber = 0;
        if (description.xLine || description.rawData.line) {
            lineNumber = (description.xLine || description.rawData.line) - 1; // x-line uses lines starts form 1
            while (lineNumber >= vm.lines.length) {
                vm.lines.push([]);
            }
        }

        vm.lines[lineNumber].push(item);
    });
}

onMounted(() => {
    const instance = getCurrentInstance();
    sharedFunctions.doOnMounted(instance);
});

onDeactivated(() => {
    sharedFunctions.onDeactivated();
});

function isAllLineHidden(line: Array<any>): boolean {
    return line.every((elem: any) => {
        return elem.description.xHideValue || elem.description.xRemoveValue || !sharedFunctions.shouldBeConstructed(elem.description, undefined, null, false);
    });
}

function shouldShowTitle(lineIndex: number): boolean {
    const firstDisplayedLineIndex = vm.lines.findIndex((line: any) => !isAllLineHidden(line));
    return firstDisplayedLineIndex === lineIndex;
}

function onModelChange(descriptionName: string|null, $event: any) {
    if (descriptionName) {
        const modelClone = { ...vm.model };
        modelClone[descriptionName] = $event;
        vm.model = modelClone;
    } else {
        vm.model = $event;
    }

    emits('modelChange', vm.model);
}

function shouldItemBeConstructed(item: any): boolean {
    const result = sharedFunctions.shouldBeConstructed(item.description, null, item.shouldItemBeConstructedPrevValue || null);

    if (item.shouldItemBeConstructedPrevValue === false && result) {
        //
    }

    item.shouldItemBeConstructedPrevValue = result;
    return result;
}
</script>

<style scoped></style>
