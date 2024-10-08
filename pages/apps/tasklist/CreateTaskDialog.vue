<script setup>
import { onMounted, ref } from 'vue';

const emit = defineEmits(['close', 'save']);
const props = defineProps({
    selectedTask: {
        type: Object,
        default: null
    }
});

const task = ref({});
const filteredMembers = ref([]);

onMounted(() => {
    if (props.selectedTask) {
        task.value = props.selectedTask;
    }
});
const getMembers = async () => {
    const response = await fetch('/demo/data/members.json');
    const { data } = await response.json();
    return data;
};
const onHide = () => {
    emit('close', task.value);
};

const onSave = () => {
    emit('save', task.value);
};

const filterMembers = async (event) => {
    const members = await getMembers();

    if (!event.query) return [];

    filteredMembers.value = members.filter((member) => member.name.toLowerCase().indexOf(event.query.toLowerCase()) === 0);
};
</script>

<template>
    <div class="p-4">
        <div class="grid p-fluid formgrid">
            <div class="col-12 field">
                <label for="name" class="text-900 font-semibold">Task Name</label>
                <InputText id="name" type="text" placeholder="Title" v-model="task.name" />
            </div>
            <div class="col-12 field">
                <label for="description" class="text-900 font-semibold">Description</label>

                <Textarea v-model="task.description" rows="5" />
                <!---      <Editor
                    v-model="task.description"
                    :pt="{
                        root: { style: { height: '150px' }, class: 'mb-6' }
                    }"
                ></Editor> -->
            </div>
            <div class="col-4 field">
                <label for="start" class="text-900 font-semibold">Date Start</label>
                <Calendar dateFormat="dd-mm-yy" :show-time="true" inputId="start" placeholder="Start Date" v-model="task.startDate"></Calendar>
            </div>
            <div class="col-4 field">
                <label for="start" class="text-900 font-semibold">Date End</label>
                <Calendar dateFormat="dd-mm-yy" :show-time="true" inputId="start" placeholder="Start Date" v-model="task.startDate"></Calendar>
            </div>
            <div class="col-4 field">
                <label for="end" class="text-900 font-semibold">Alert 1</label>
                <InputNumber v-model="value1" inputId="locale-user" :minFractionDigits="2" />
            </div>
            <div class="col-12 field">
                <label for="vehicles" class="text-900 font-semibold">Add Vehicles</label>
                <AutoComplete inputId="vehicles" v-model="task.vehicles" :suggestions="filteredMembers" field="name"
                              multiple @complete="filterMembers($event)" :inputStyle="{ height: '2.5rem' }">
                    <template #chip="{ value }">
                        <div class="flex align-items-center">
                            <img :src="'/demo/images/avatar/' + value.image" :alt="value.name" class="h-2rem w-2rem mr-2" />
                            <span class="text-900 font-medium">{{ value.name }}</span>
                        </div>
                    </template>
                    <template #item="{ item }">
                        <div class="flex align-items-center">
                            <img :src="'/demo/images/avatar/' + item.image" :alt="item.name" class="h-2rem w-2rem mr-2" />
                            <span class="text-900 font-medium">{{ item.name }}</span>
                        </div>
                    </template>
                </AutoComplete>
            </div>
            <!--
            <div class="col-12 field">
                <label for="members" class="text-900 font-semibold">Add Team Member</label>
                <AutoComplete inputId="members" v-model="task.members" :suggestions="filteredMembers" field="name" multiple @complete="filterMembers($event)" :inputStyle="{ height: '2.5rem' }">
                    <template #chip="{ value }">
                        <div class="flex align-items-center">
                            <img :src="'/demo/images/avatar/' + value.image" :alt="value.name" class="h-2rem w-2rem mr-2" />
                            <span class="text-900 font-medium">{{ value.name }}</span>
                        </div>
                    </template>
                    <template #item="{ item }">
                        <div class="flex align-items-center">
                            <img :src="'/demo/images/avatar/' + item.image" :alt="item.name" class="h-2rem w-2rem mr-2" />
                            <span class="text-900 font-medium">{{ item.name }}</span>
                        </div>
                    </template>
                </AutoComplete>
            </div>
        -->
            <div class="col-12 field">
                <label for="demo[]" class="text-900 font-semibold">Add Files</label>
                <FileUpload name="demo[]" url="/api/upload" @upload="onAdvancedUpload($event)" :multiple="true" accept="image/*" :maxFileSize="1000000">
                    <template #empty>
                        <p>Drag and drop files to here to upload.</p>
                    </template>
                </FileUpload>
            </div>

            <div class="col-12 flex justify-content-end mt-4">
                <Button class="w-8rem mr-3" outlined icon="pi pi-times" label="Cancel" @click="onHide()"></Button>
                <Button class="w-8rem" icon="pi pi-check" label="Save" @click="onSave()"></Button>
            </div>
        </div>
    </div>
</template>
