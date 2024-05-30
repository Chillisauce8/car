<template>
  <MultiSelect v-model="_fakeModel"
               @update:modelValue="onModelChange($event)"
               :options="autocompleteItems"
               :optionLabel="(data) => data?.name || data?.title || data"
               :placeholder="vm.placeholderValue"
               :showClear="!props.description.required"
               :maxSelectedLabels="getLimitTo()"
               display="chip" class="w-full md:w-20rem">
  </MultiSelect>

  <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
</template>

<script setup lang="ts">
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import { isObject, isEqual } from '~/service/utils';
import useBaseSelectableControl from '~/composables/schema-forms/useBaseSelectableControl';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const formRef = ref(null);
const selfRef = ref(null);
const parentObjectFieldRef = ref(null);
const parentGroupFieldRef = ref(null);
const parentDynamicControlRef = ref(null);


const baseFieldExport = useBaseSelectableControl(props, emits);

let {
  vm,
  im,
  sharedFunctions,
} = baseFieldExport;


const correctExistingValueBase = sharedFunctions.correctExistingValue;
const initFieldBase = sharedFunctions.initField;
const processXFeaturesBase = sharedFunctions.processXFeatures;
const getDefaultValueBase = sharedFunctions.getDefaultValue;


const validateRules = computed(() => {
  const result: any = {
  };

  if (props.description.required) {
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.model });

const autocompleteItems = ref();

const _fakeModel = ref();

let _isObjects = false;

let _prevXFeatures: any;


onMounted(() => {
  const refs = {
    self: selfRef,
    form: {
      formName: formRef.value?.name,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectFieldRef,
    parentGroupField: parentGroupFieldRef,
    parentDynamicControl: parentDynamicControlRef,
  };

  sharedFunctions.setRefs(refs);

  sharedFunctions.doOnMounted();
});

function onModelChange(value: any) {
  _fakeModel.value = value;

  if (value) {
    if (_isObjects) {
      vm.model = value.map((item: any) => {
        return autocompleteItems.value.find((item: any) => value.id === item.id);
      });
    } else {
      vm.model = value;
    }
  } else {
    vm.model = undefined;
  }

  $v.value.$validate();
}

function initField() {
  initFieldBase();
  _initInnerData();
}

function getLimitTo() {
  if (props.description.xLimitTo === 'null') {
    return null;
  } else if (props.description.xLimitTo) {
    return props.description.xLimitTo;
  }

  return 30;
}

function processXFeatures() {
  const features = processXFeaturesBase();
  if (!isEqual(_prevXFeatures, features) ||
    !isEqual(vm.cachedPossibleValues, autocompleteItems.value)) {
    _prevXFeatures = features;
    _initInnerData();
  }

  return features;
}

function getDefaultValue(): any {
  const defaultValue = getDefaultValueBase();
  if (defaultValue && !(defaultValue instanceof Array)) {
    return [defaultValue];
  }

  return defaultValue;
}

function fillEmptyModel() {
  if (vm.model === undefined) {
    const defaultValue = getDefaultValue();

    if (defaultValue === undefined) {
      vm.model = [];
    } else {
      vm.model = defaultValue;
      _initInnerModel();
    }
  }
}

function correctExistingValue() {
  if (!Array.isArray(vm.model)) {
    vm.model = [];
  } else {
    correctExistingValueBase();
  }
}

function _initInnerData() {
  autocompleteItems.value = sharedFunctions.filterPossibleValues();
  _isObjects = autocompleteItems.value && autocompleteItems.value.length && isObject(autocompleteItems.value[0]);

  if (_fakeModel) {
    return;
  }

  _initInnerModel();
}

function _initInnerModel() {
  if (vm.model) {
    if (_isObjects) {
      _fakeModel.value = vm.model.map((item: any) => {
        return autocompleteItems.value.find((item: any) => item.id === item.id);
      });
    } else {
      _fakeModel.value = vm.model;
    }
  } else {
    _fakeModel.value = [];
  }
}


sharedFunctions.initField = initField;
sharedFunctions.processXFeatures = processXFeatures;
sharedFunctions.getDefaultValue = getDefaultValue;
sharedFunctions.fillEmptyModel = fillEmptyModel;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>