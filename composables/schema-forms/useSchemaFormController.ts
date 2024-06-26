import {
  cloneDeep,
  deleteNullProperties,
  deletePropertiesWithPrefix,
  isObject,
  stripProperties,
  isEqual,
  uniq,
  setObjectPropertyByString
} from '~/service/utils';
import { schemaFormsProcessingHelper } from '~/service/schema-forms/schemaFormsProcessing.service';
import { schemaFormsBuildHelperFactory } from '~/service/schema-forms/schemaFormsBuildHelper.factory';
import { schemaPaths } from '~/service/schema-forms/schemaPaths.service';
// @ts-ignore
import { useToast } from 'primevue/usetoast';
import { sysService } from '~/service/http/sys.service';


export default function useSchemaFormController(formName: string): any {

  const toast = useToast();

  const vm = reactive({
    name: formName,
    inProgress: true,
    saveError: '',
    model: undefined,
    savedModelResult: undefined,
    initialModel: undefined,
    editMode: false,
    formTarget: '',
    formIsChanged: false,
    showAnchors: false,
    showHistoryButton: true,
    dataSaved: false,
    schemaFormsBuildHelper: undefined,
  });

  const initDone = ref(false);

  const formDescription = ref(null);


  const sharedFunctions = {
    doOnMounted: (): void => {
      init();
    },

    onDeactivated: (): void => {
      schemaFormsProcessingHelper.unRegisterForm(vm.name);
    },

    createTarget: async (dataToSave: any): Promise<any> => {
      return null;
    },

    updateTarget: async (dataToSave: any): Promise<any> => {
      return null;
    },

    getTargetName: (): string => {
      return '';
    },

    getSchemaName: (): string => {
      return '';
    },

    isEditMode: (): boolean => {
      return false;
    },

    onCreated: (id: string): void => {
      //
    },

    getTarget: async (): Promise<any> => {
      return null;
    },

    needPageReload: (): boolean => {
      return false;
    },

    getSchema: async (): Promise<any> => {
      const schemaName = sharedFunctions.getSchemaName();
      return sysService.getSchema(schemaName)
        .then((schema: any) => {
            vm.schemaFormsBuildHelper = schemaFormsBuildHelperFactory.getInstance(schemaName, schema);
        });
    },

    // const schema = {
    //   "name": "events",
    //   "description": "",
    //   "properties": {
    //     "name": {
    //       "type": "string",
    //       "title": "Name"
    //     },
    //     "description": {
    //       "type": "string",
    //       "title": "Description"
    //     },
    //     "startDate": {
    //       "type": "string",
    //       "title": "Date"
    //     },
    //     "endDate": {
    //       "type": "string",
    //       "title": "End Date"
    //     },
    //     "alerts": {
    //       "type": "array",
    //       "title": "Alerts",
    //       "items": {
    //         "type": "object",
    //         "properties": {
    //           "dateTime": {
    //             "type": "string"
    //           },
    //           "relativeTime": {
    //             "type": "string",
    //             "enum": [
    //               "At time of event",
    //               "5 minutes before",
    //               "10 minutes before",
    //               "15 minutes before",
    //               "30 minutes before",
    //               "1 hour before",
    //               "2 hours before",
    //               "1 day before",
    //               "2 days before",
    //               "1 week before"
    //             ]
    //           }
    //         }
    //       }
    //     },
    //     "files": {
    //       "type": "array",
    //       "title": "Files",
    //       "items": {
    //         "type": "object",
    //         "properties": {
    //           "id": {
    //             "type": "string"
    //           }
    //         }
    //       }
    //     },
    //     "status": {
    //       "type": "array",
    //       "title": "Status",
    //       "items": {
    //         "type": "object",
    //         "properties": {
    //           "state": {
    //             "type": "string",
    //             "enum": [
    //               "Outstanding",
    //               "Completed",
    //               "Deleted"
    //             ]
    //           },
    //           "user": {
    //             "type": "object",
    //             "properties": {
    //               "id": {
    //                 "type": "string"
    //               },
    //               "name": {
    //                 "type": "string"
    //               }
    //             }
    //           },
    //           "dateTime": {
    //             "type": "string"
    //           }
    //         }
    //       }
    //     },
    //     "vehicles": {
    //       "type": "array",
    //       "title": "Vehicles",
    //       "items": {
    //         "type": "object",
    //         "properties": {
    //           "id": {
    //             "type": "string"
    //           }
    //         }
    //       }
    //     }
    //   },
    //   "title": "events",
    //   "_doc": "6630c1aead18f5f1de44dfc2"
    // }

    buildGroupsDescription: async (): Promise<any> => {
      return null;
    },

    save: (): void => {
      vm.saveError = '';
      vm.isFormNotValid = false;

      if (!schemaFormsProcessingHelper.isFormValid(vm.name)) {
        schemaFormsProcessingHelper.touchAllControlsForForm(vm.name);
        vm.saveError = 'Form validation error';
        vm.isFormNotValid = true;
        return;
      }

      clearObsoleteFields();

      vm.inProgress = true;
      const dataToSave = getDataToSave();

      let savePromise;
      if (vm.editMode) {
        savePromise = sharedFunctions.updateTarget(dataToSave);
      } else {
        savePromise = sharedFunctions.createTarget(dataToSave);
      }

      savePromise
        .then((result: any) => {
          vm.savedModelResult = result;
          const data = result['data'] || result;
          vm.initialModel = cloneDeep(data);
          vm.model = data;
          vm.formIsChanged = false;
          vm.dataSaved = true;

          toast.add({ severity: 'success', summary: 'Success Message', detail: 'Saved Successfully', life: 3000 });

          if (!sharedFunctions.isEditMode()) {
            sharedFunctions.onCreated(data?._doc ?? data?.id ?? data?.public_id);
          } else if (sharedFunctions.needPageReload()) {
            setTimeout(() => window.location.reload(), 100);
          }
        })
        .catch((result: any) => {
          saveErrorHandler(result);
          return null;
        })
        .finally(() => {
          vm.inProgress = false;
        });
    }
  };

  function getDataToSave() {
    const dataToSave = cloneDeep(vm.model);
    deleteNullProperties(dataToSave, true);
    stripProperties(dataToSave, true);
    deleteStructureProperties(dataToSave);
    return dataToSave;
  }

  function deleteStructureProperties(data: any) {
    if (!isObject(data)) {
      return;
    }

    deletePropertiesWithPrefix(data, (key: string) =>
      vm.schemaFormsBuildHelper.isStructureTag(key), true);
  }

  function saveErrorHandler(result: any) {
    if (!result) {
      return;
    }

    const error = result.error || result;
    const errorMessage = error.message || error;
    vm.saveError = errorMessage;

    toast.add({ severity: 'error', summary: 'Error Message', detail: `Failed ${errorMessage}`, life: 3000 });
  }

  function clearObsoleteFields() {
    let knownFields = vm.schemaFormsBuildHelper.schemaParser.getAllPaths();

    knownFields.push('title');
    knownFields.push('_doc');
    knownFields.push('_type');
    knownFields.push('_hash');
    knownFields.push('_metadata');
    knownFields.push('_statistics*');
    knownFields.push('lastUpdated*');
    knownFields.push('lastEdited*');
    knownFields.push('created*');
    knownFields.push('gmailAuthData*');
    knownFields.push('*filter*');
    knownFields.push('*filters*');

    knownFields = knownFields.filter((item: string) => {
      return item.search(/^\d/) === -1;
    });

    const keys: Array<string> = _recListModelFields(vm.model);

    keys.forEach((key: string) => {
      let keyToCheck = key.replace( /\.[0-9]+\./g, '.' );
      keyToCheck = keyToCheck.replace( /\.[0-9]+$/g, '' );

      const res = knownFields.find((knownField: any) => {
        if (knownField === keyToCheck) {
          return true;
        }

        if (knownField[0] === '*' && knownField[knownField.length - 1] === '*') {
          return keyToCheck.indexOf(knownField.slice(1, -1)) !== -1;
        } else if (knownField[knownField.length - 1] === '*') {
          return keyToCheck.indexOf(knownField.slice(0, -1)) === 0;
        }
      });

      if (!res) {
        if (key.indexOf('_statistics.') === 0) {
          return;
        }

        setObjectPropertyByString(vm.model, key, undefined);
      }
    });
  }

  function init() {
    vm.model = {};
    vm.formTarget = sharedFunctions.getTargetName();

    vm.editMode = sharedFunctions.isEditMode();

    getAllSettings()
      .then(() => {
        if (Object.keys(vm.model).length === 0) {
          vm.model = vm.schemaFormsBuildHelper.buildEmptyModel();
        }
      })
      .then(() => sharedFunctions.buildGroupsDescription())
      .then((result: Array<Object>) => {
        formDescription.value = result;
      })
      .then(() => {
        schemaFormsProcessingHelper.registerForm(vm.name);
      })
      .finally(() => {
        vm.inProgress = false;
        initDone.value = true;
      });

    schemaFormsProcessingHelper.onFormUpdated(
      () => {
        const formIsChangedPrevValue = vm.formIsChanged;

        if (vm.initialModel) {
          const preparedModel = getDataToSave();

          vm.formIsChanged = !isEqual(JSON.stringify(vm.initialModel),
            JSON.stringify(preparedModel));
        } else {
          vm.formIsChanged = true;
        }

        if (formIsChangedPrevValue !== vm.formIsChanged) {
          //
        }

        if (vm.isFormNotValid) {
          if (schemaFormsProcessingHelper.isFormValid(vm.name)) {
            vm.saveError = '';
            vm.isFormNotValid = false;
          }
        }

        if (!vm.modelCopyToRestoreHistoryState) {
          vm.modelCopyToRestoreHistoryState = cloneDeep(vm.model);
        }
      }
    );
  }

  async function getAllSettings(): Promise<any> {
    const promises = [sharedFunctions.getSchema()];

    if (vm.editMode) {
      const getTargetPromise = sharedFunctions.getTarget()
        .then((data: any) => {
          vm.initialModel = cloneDeep(data);
          vm.model = data;
        })
        .then(() => {
          return loadAdditionalDefinitions(vm.model);
        })
        .catch((error: any) => {
          vm.saveError = 'Unable to get ' + sharedFunctions.getTargetName();
          return null;
        });

      promises.push(getTargetPromise);
    }

    return Promise.all(promises);
  }

  async function loadAdditionalDefinitions(model: any): Promise<any> {
    if (!model) {
      return null;
    }

    const definitionsToLoad = findAdditionalDefinitions(vm.model);

    if (!definitionsToLoad.length) {
      return null;
    }

    const promises = [];

    for (const definitionToLoad of definitionsToLoad) {
      promises.push(schemaPaths.addSchema(definitionToLoad));
    }
}

  function findAdditionalDefinitions(model: any): any[] {
    if (model['variable'] && model['type']) {
      return [model['type']];
    }

    const definitions: any[] = [];

    model.forEach((value: any, key: string) => {
      if (isObject(value)) {
        const innerResults = findAdditionalDefinitions(value);
        innerResults.forEach((res: string) => {
          definitions.push(res);
        });
      }
    });

    return uniq(definitions);
  }

  function _recListModelFields(data: any) {
    const fields: any[] = [];

    data.forEach((value: any, key: string) => {
      fields.push(key);

      if (isObject(value)) {  // && (!_.isArray(value))) {
        const innerFields = _recListModelFields(value);

        innerFields.forEach((field: string) => {
          fields.push(key + '.' + field);
        });
      }
    });

    return fields;
  }


  return {
    vm,
    formDescription,
    sharedFunctions,
    initDone,
  };
}
