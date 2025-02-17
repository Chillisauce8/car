<template>
  <ComponentRender :componentName="vm.componentName"
                   :componentProperties="componentProperties"
                   :validator="$v"
                   :model="fakeModel" @onModelChange="onModelChange($event)">
  </ComponentRender>
</template>


<script setup lang="ts">
import { isString, isDate } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, maxLength, email } from '@vuelidate/validators'
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
import { DateHelper } from '~/service/date-helper';
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


const {vm, sharedFunctions} = useBaseControl(props, emits);


const componentProperties = {
  dateFormat: "D dd M yy",
  showIcon: true,
  iconDisplay: "input",
  minDate: props.description.minimum,
  maxDate: props.description.maximum,
  manualInput: false,
  showButtonBar: true,
  hourFormat: "24",
  timeOnly: false,
  ...props.description,
};

if (props.description.format === 'time') {
  componentProperties['timeOnly'] = true;
}

if (props.description.format === 'date-time') {
  componentProperties['showTime'] = true;
}


const initFieldBase = sharedFunctions.initField;
const correctExistingValueBase = sharedFunctions.correctExistingValue;
const getDefaultValueBase = sharedFunctions.getDefaultValue;


const dateHelper = new DateHelper();

const fakeModel = ref();


const validateRules = computed(() => {
  const result: any = {
    //minValue
    //maxValue
  };

  if (props.description.required) {
    result['model'] = {
      required
    }
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

  _prepareMinMaxValues();

  fillEmptyModel();

  if (vm.model) {
    if (isString(vm.model)) {
      fakeModel.value = dateHelper.parseSaveDateFormat(vm.model);
    } else {
      fakeModel.value = vm.model;
    }
  }
}

function onModelChange(value: any) {
  fakeModel.value = value;

  if (value) {
    if (props.description.format === 'date-time') {
      vm.model = dateHelper.saveDateTimeFormat(value);
    } else if (props.description.format === 'time') {
      vm.model = dateHelper.saveTimeFormat(value);
    } else {
      vm.model = dateHelper.saveDateFormat(value);
    }
  } else {
    vm.model = undefined;
  }

  emits('modelChange', vm.model);
}

function getDefaultValue(): any {
  const defaultValue = getDefaultValueBase();
  if (defaultValue) {
    if (isDate(defaultValue)) {
      return defaultValue;
    }

    return _parseDateString(defaultValue);
  }
}

function fillEmptyModel() {
  if (vm.model === undefined) {
    const defaultValue = getDefaultValue();

    if (defaultValue === undefined) {
      vm.model = null;
    } else {
      vm.model = defaultValue;
    }
  }
}

function correctExistingValue() {
  if (!isString(vm.model) && !isDate(vm.model)) {
    vm.model = null;
  } else {
    if (props.description.timeOnly || props.description.format === 'time') {
      const timeValue = dateHelper.parseTime(vm.model);
      if (timeValue) {
        vm.model = timeValue;
      }
    }

    correctExistingValueBase();
  }
}

function _prepareMinMaxValues() {
  if (props.description.component === 'DatePicker') {
    if (props.description['minimumDate']) {
      props.description.minimum = _parseDateString(props.description['minimumDate']);
    }

    if (props.description['maximumDate']) {
      props.description.maximum = _parseDateString(props.description['maximumDate']);
    }
  }
}

function _parseDateString(value: string): Date|undefined {
  if (value === 'today') {
    return new Date();
  } else {
    return dateHelper.parseSaveDateFormat(value);
  }
}

sharedFunctions.initField = initField;
sharedFunctions.getDefaultValue = getDefaultValue;
sharedFunctions.fillEmptyModel = fillEmptyModel;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>
