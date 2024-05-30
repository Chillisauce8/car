<template>
  <FloatLabel>
  <Calendar v-model="fakeModel"
              @update:modelValue="onModelChange($event)"
              dateFormat="D dd M yy"
              showIcon iconDisplay="input"
              :name="props.description.name" :class="{'p-invalid': $v.$error}"
              :minDate="props.description.minimum" :maxDate="props.description.maximum"
              :manualInput="false" showButtonBar
              :invalid="$v.$error"/>
    <label :for="props.description.name">{{vm.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v[props.description.name]"></FieldError>
</template>


<script setup lang="ts">
import { isString, isDate } from '~/service/utils';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, maxLength, email } from '@vuelidate/validators'
import FieldError from '~/components/schema-forms/FieldError.vue';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
import { DateHelper } from '~/service/date-helper';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const formRef = ref(null);
const selfRef = ref(null);
const parentObjectFieldRef = ref(null);
const parentGroupFieldRef = ref(null);
const parentDynamicControlRef = ref(null);


const {vm, sharedFunctions} = useBaseControl(props, emits);


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
    result[props.description.name]['required'] = required;
  }

  return result;
});


const $v = useVuelidate(validateRules, { [props.description.name]: vm.model });


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
    vm.model = dateHelper.saveDateFormat(value);
  } else {
    vm.model = undefined;
  }
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
    correctExistingValueBase();
  }
}

function _prepareMinMaxValues() {
  if (props.description.formType === 'date') {
    if (props.description['minimumDate']) {
      props.description.minimum = _parseDateString(props.description['minimumDate']);
    }

    if (props.description['maximumDate']) {
      props.description.maximum = props._parseDateString(props.description['maximumDate']);
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