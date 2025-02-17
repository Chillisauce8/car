<template>
  <ComponentRender :componentName="vm.componentName"
                   :componentProperties="componentProperties"
                   :validator="$v"
                   :model="vm.model" @onModelChange="onModelChangeDebounced($event)">
  </ComponentRender>
</template>

<script setup lang="ts">
import { isString } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, minLength, maxLength, email, url } from '@vuelidate/validators'
import { patternValidator } from '~/service/forms-validators';
import { debounce } from '~/service/utils';
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import { getCurrentInstance } from 'vue';
import { isDate } from '~/service/utils';
import { DateHelper } from '~/service/date-helper';


const dateHelper = new DateHelper();


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


let {vm, sharedFunctions} = useBaseControl(props, emits);


vm.originalModel = undefined;
vm.componentName = vm.componentName || 'InputText';

const componentProperties = {
  ...props.description,
};

if (vm.componentName === 'DatePicker') {
  if (props.description.format === 'time') {
    componentProperties['timeOnly'] = true;
  }

  if (props.description.format === 'date-time') {
    componentProperties['showTime'] = true;
  }
}


const initFieldBase = sharedFunctions.initField;
const setModelBase = sharedFunctions.setModel;
const correctExistingValueBase = sharedFunctions.correctExistingValue;
const getDefaultValueBase = sharedFunctions.getDefaultValue;


const validateRules = computed(() => {
  const result: any = {
    model: {
      minLength: minLength(props.description.minLength || 0),
      maxLength: maxLength(props.description.maxLength || 100),
      pattern: patternValidator(new RegExp(props.description.pattern, 'gi')),
    },
  };

  if (props.description.type === 'email') {
    result['model']['email'] = email;
  }

  if (props.description.type === 'url') {
    result['model']['url'] = url;
  }


  if (props.description.required) {
    result['model']['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, vm, {$autoDirty: true});


onMounted(() => {
  const instance = getCurrentInstance();
  sharedFunctions.doOnMounted(instance, $v);
});

function initField() {
  initFieldBase();
  vm.originalModel = vm.model;

  _prepareMinMaxValues();
}

function setModel(value: any, updated?: boolean) {
  setModelBase(value, updated);

  if (!vm.originalModel || (isString(vm.originalModel) && vm.originalModel.trim() !== vm.model)) {
    vm.originalModel = vm.model;
  }
}

function onModelChange(value: any) {
  vm.originalModel = value;

  if (value) {
    if (isDate(value)) {
      vm.model = dateHelper.saveDateFormat(value);
    } else {
      vm.model = value.trim();

      if (vm.model.length === 0) {
        vm.model = undefined;
      }
    }
  } else {
    vm.model = undefined;
  }

  $v.value.$validate();
  emits('modelChange', vm.model);
}

const onModelChangeDebounced = debounce(onModelChange, 100);

function correctExistingValue() {
  if (!isString(vm.model)) {
    vm.model = undefined;
  } else {
    vm.model = vm.model.trim();

    if (props.description.type === 'email') {
      vm.model = vm.model ? vm.model.toLowerCase() : '';
    }

    if (vm.model.length === 0) {
      vm.model = undefined;
    } else {
      correctExistingValueBase();
    }
  }
}

function getDefaultValue(): any {
  const defaultValue = getDefaultValueBase();
  if (defaultValue && vm.componentName === 'DatePicker') {
    if (isDate(defaultValue)) {
      return defaultValue;
    }

    return _parseDateString(defaultValue);
  }
}

function _prepareMinMaxValues() {
  if (vm.componentName === 'DatePicker') {
    if (props.description['minimumDate']) {
      props.description.minimum = _parseDateString(props.description['minimumDate']);
    }

    if (props.description['maximumDate']) {
      props.description.maximum = _parseDateString(props.description['maximumDate']);
    }
  }
}

function _parseDateString(value: string): Date|undefined {
  if (vm.componentName === 'DatePicker' && value === 'today') {
    return new Date();
  } else {
    return dateHelper.parseSaveDateFormat(value);
  }
}

function correctModelBeforeSet(value: any) {
  if (props.description.type === 'email') {
    return value ? value.toLowerCase() : '';
  }

  return value;
}

sharedFunctions.initField = initField;
sharedFunctions.setModel = setModel;
sharedFunctions.correctExistingValue = correctExistingValue;
sharedFunctions.correctModelBeforeSet = correctModelBeforeSet;
sharedFunctions.getDefaultValue = getDefaultValue;



</script>

<style>
</style>
