<template>
    <FileUpload mode="basic" :name="props.description.name"
                class="file-input"
                :multiple="true"
                customUpload @uploader="customUploader"
                v-if="!hasFile()"
                @select="onFileChanged($event)" />

    <div class="row queue" v-if="vm.model">
      <p class="h8 name">{{vm.model.name}}</p>
      <p class="h8 name">{{vm.model.type}}</p>
      <p class="padding_0_2 text-align_center h8">~{{ getFileSizeString() }}</p>

      <Button icon="pi pi-eye" class="link" aria-label="Open File"
          @click="showFile()" v-if="canShowFile()" v-tooltip.bottom="'Open File'">
      </Button>

      <Button icon="pi pi-download" class="link" aria-label="Download File"
          @click="downloadFile()" v-if="hasFile()" v-tooltip.bottom="'Download File'">
      </Button>

      <Button icon="pi pi-times" class="link" aria-label="Remove File"
          @click="clearSelectedFile()" v-if="hasFile()" v-tooltip.bottom="'Remove File'">
      </Button>
    </div>

    <FieldError class="form-text-error" :vuelidate-field="$v['model']"></FieldError>
</template>


<script setup lang="ts">
import FileUpload from 'primevue/fileupload';
import { fileHelperService } from '~/service/file/file-helper-service';
import useBaseControl from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { useVuelidate } from '@vuelidate/core';
// @ts-ignore
import { required } from '@vuelidate/validators'
import type { BaseControlProps, BaseControlEmits } from '~/composables/schema-forms/useBaseControl';
// @ts-ignore
import { getCurrentInstance } from 'vue';


// @ts-ignore
const props = defineProps<BaseControlProps>();
// @ts-ignore
const emits = defineEmits<BaseControlEmits>();


const baseFieldExport = useBaseControl(props, emits);

const {
  vm,
  sharedFunctions,
} = baseFieldExport;


const validateRules = computed(() => {
  const result: any = {
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

  emits('initDone', {componentName: 'Upload'});
});


const customUploader = async (event: any) => {
  //
};

function onFileChanged(event: {files: File[]}) {
  if (event.files[0]) {
    const file = event.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const value: string = <string>reader.result;

      const extension = file.type || fileHelperService.getFileExtension(file.name);
      const type = fileHelperService.getFileType(file);

      vm.model = {
        name: file.name,
        extension,
        type,
        size: file.size,
        value: value.split(',')[1],
      };

      emits('modelChange', vm.model);
    }
  }
}

function getFileSizeString() {
  if (vm.model) {
    return fileHelperService.convertBytesToFileSizeString(vm.model.size);
  }
}

function clearSelectedFile() {
  vm.model = null;
}

function hasFile(): boolean {
  return vm.model && vm.model.value;
}

function canShowFile(): boolean {
  if (!hasFile()) {
    return false;
  }

  return fileHelperService.canShowFile(vm.model.name);
}

function showFile() {
  if (vm.model && vm.model.value) {
    fileHelperService.showFile(vm.model.value, vm.model.type);
  }
}

function downloadFile() {
  if (vm.model && vm.model.value) {
    fileHelperService.downloadFile(vm.model.value, vm.model.type, vm.model.name);
  }
}

</script>

<style scoped>

</style>
