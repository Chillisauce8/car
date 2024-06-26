<template>
  <FloatLabel>
    <InputText type="text" v-model="vm.originalModel"
               @update:modelValue="onModelChangeDebounced($event)"
               :name="props.description.name" :class="{'p-invalid': $v.$error}"
               :invalid="$v.$error"/>
    <label :for="props.description.name">{{vm.placeholderValue}}</label>
  </FloatLabel>
  <FieldError class="form-text-error" :vuelidate-field="$v['model']"></FieldError>
</template>

<script setup lang="ts">
import { isString } from '~/service/utils';
// @ts-ignore
import { extend } from 'vue-extend-reactive';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required, minLength, maxLength } from '@vuelidate/validators'
import { patternValidator } from '~/service/forms-validators';
import FieldError from '~/components/schema-forms/FieldError.vue';
import { debounce } from '~/service/utils';
import type { BaseControlProps } from '~/composables/schema-forms/useBaseControl';
import type { BaseFieldEmits } from '~/composables/schema-forms/useBaseField';
// @ts-ignore
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseFieldEmits>();


const selfRef = ref(null);


let {vm, sharedFunctions} = useBaseControl(props, emits);


vm = extend(vm, {
  originalModel: undefined,
});

const initFieldBase = sharedFunctions.initField;
const setModelBase = sharedFunctions.setModel;
const correctExistingValueBase = sharedFunctions.correctExistingValue;



const validateRules = computed(() => {
  const result: any = {
    model: {
      minLength: minLength(props.description.minLength || 0),
      maxLength: maxLength(props.description.maxLength || 100),
      pattern: patternValidator(new RegExp(props.description.pattern, 'gi')),
    },
  };

  if (props.description.required) {
    result['model']['required'] = required;
  }

  return result;
});



const $v = useVuelidate(validateRules, vm, {$autoDirty: true});


onMounted(() => {
  const instance = getCurrentInstance();

  const parentObjectField = sharedFunctions.getParentByName(instance, 'ObjectField');
  const parentDynamicControl = sharedFunctions.getParentByName(instance, 'DynamicControl');
  const parentGroupField = sharedFunctions.getParentByName(instance, 'FormGroup');
  const schemaForm = sharedFunctions.getParentByName(instance, 'SchemaForm');

  const refs = {
    self: instance,
    form: {
      formName: schemaForm?.props.formName,
      needCorrectExistingValues: true,
    },
    parentObjectField: parentObjectField,
    parentGroupField: parentGroupField,
    parentDynamicControl: parentDynamicControl,
  };

  sharedFunctions.setRefs(refs);
  sharedFunctions.setValidation($v);

  sharedFunctions.doOnMounted();
});

function initField() {
  initFieldBase();
  vm.originalModel = vm.model;
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
    vm.model = value.trim();

    if (vm.model.length === 0) {
      vm.model = undefined;
    }
  } else {
    vm.model = undefined;
  }

  $v.value.$validate();
  emits('modelChange', vm.model);
}


const onModelChangeDebounced = debounce(onModelChange, 1000);

function correctExistingValue() {
  if (!isString(vm.model)) {
    vm.model = undefined;
  } else {
    vm.model = vm.model.trim();

    if (vm.model.length === 0) {
      vm.model = undefined;
    } else {
      correctExistingValueBase();
    }
  }
}


sharedFunctions.initField = initField;
sharedFunctions.setModel = setModel;
sharedFunctions.correctExistingValue = correctExistingValue;

</script>

<style scoped>

</style>
