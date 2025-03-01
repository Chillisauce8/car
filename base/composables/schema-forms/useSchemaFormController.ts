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

/**
 * Composable for managing schema form state and operations
 * @param formName Name of the form to control
 * @param fields Optional fields configuration
 * @returns Form controller state and functions
 */
export default function useSchemaFormController(formName: string, fields?: Object): any {

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
    /**
     * Initializes form when component is mounted
     */
    doOnMounted: (): void => {
      init();
    },

    /**
     * Cleanup when component is deactivated
     */
    onDeactivated: (): void => {
      schemaFormsProcessingHelper.unRegisterForm(vm.name);
    },

    /**
     * Creates a new target entity
     * @param dataToSave Data to save
     */
    createTarget: async (dataToSave: any): Promise<any> => {
      return null;
    },

    /**
     * Updates an existing target entity
     * @param dataToSave Data to save
     */
    updateTarget: async (dataToSave: any): Promise<any> => {
      return null;
    },

    /**
     * Deletes a target entity
     * @param dataId ID of the data to delete
     */
    deleteTarget: async (dataId: string): Promise<any> => {
      return null;
    },

    /**
     * Gets the name of the target entity
     * @returns Target name
     */
    getTargetName: (): string => {
      return '';
    },

    /**
     * Gets the name of the schema
     * @returns Schema name
     */
    getSchemaName: (): string => {
      return '';
    },

    /**
     * Checks if the form is in edit mode
     * @returns True if in edit mode, false otherwise
     */
    isEditMode: (): boolean => {
      return false;
    },

    /**
     * Callback for when a new entity is created
     * @param id ID of the created entity
     */
    onCreated: (id: string): void => {
      //
    },

    /**
     * Gets the target entity data
     * @returns Target data
     */
    getTarget: async (): Promise<any> => {
      return null;
    },

    /**
     * Checks if the page needs to be reloaded
     * @returns True if reload is needed, false otherwise
     */
    needPageReload: (): boolean => {
      return false;
    },

    /**
     * Gets the schema for the form
     * @param fields Optional fields configuration
     * @returns Schema data
     */
    getSchema: async (fields?: Object): Promise<any> => {
      const schemaName = sharedFunctions.getSchemaName();
      return sysService.getSchema(schemaName)
        .then((schema: any) => {
            vm.schemaFormsBuildHelper = schemaFormsBuildHelperFactory.getInstance(schemaName, schema, fields);
        });
    },

    /**
     * Builds the form description
     * @returns Form description
     */
    buildFormDescription: async (): Promise<any> => {
      return null;
    },

    /**
     * Deletes raw data
     * @param dataId ID of the data to delete
     */
    deleteRaw: async (dataId: string): Promise<void> => {
      return sharedFunctions.deleteTarget(dataId);
    },

    /**
     * Saves raw data
     * @param dataToSave Data to save
     */
    saveRaw: async (dataToSave: any): Promise<void> => {
      let savePromise;
      if (dataToSave?._id) {
        savePromise = sharedFunctions.updateTarget(dataToSave);
      } else {
        savePromise = sharedFunctions.createTarget(dataToSave);
      }

      return savePromise
        .then((result: any) => {
          toast.add({ severity: 'success', summary: 'Success Message', detail: 'Saved Successfully', life: 3000 });
          return result;
        })
        .catch((result: any) => {
          saveErrorHandler(result);
        });
    },

    /**
     * Saves the form data
     * @param dataToSave Data to save
     */
    save: async (dataToSave: any): Promise<void> => {
      vm.saveError = '';
      vm.isFormNotValid = false;

      if (!schemaFormsProcessingHelper.isFormValid(vm.name)) {
        schemaFormsProcessingHelper.touchAllControlsForForm(vm.name);
        vm.saveError = 'Form validation error';
        vm.isFormNotValid = true;
        return;
      }

      vm.inProgress = true;
      const _dataToSave = filterDataToSave(dataToSave);

      clearObsoleteFields(_dataToSave);

      let savePromise;
      if (vm.editMode) {
        savePromise = sharedFunctions.updateTarget(_dataToSave);
      } else {
        savePromise = sharedFunctions.createTarget(_dataToSave);
      }

      return savePromise
        .then((result: any) => {
          vm.savedModelResult = result;
          const data = result?.['data']?._id ? result?.data : result;
          vm.initialModel = cloneDeep(data);
          vm.model = data;
          vm.formIsChanged = false;
          vm.dataSaved = true;

          // toast.add({ severity: 'success', summary: 'Success Message', detail: 'Saved Successfully', life: 3000 });

          if (!sharedFunctions.isEditMode()) {
            sharedFunctions.onCreated(data?._id ?? data?.id ?? data?.public_id);
          } else if (sharedFunctions.needPageReload()) {
            setTimeout(() => window.location.reload(), 100);
          }

          return result;
        })
        .catch((result: any) => {
          saveErrorHandler(result);
        })
        .finally(() => {
          vm.inProgress = false;
        });
    }
  };

  /**
   * Filters data before saving by removing null properties and stripping special fields
   * @param dataToSave Raw data to filter
   * @returns Filtered data ready for saving
   */
  function filterDataToSave(dataToSave: any) {
    const _dataToSave = cloneDeep(dataToSave);
    deleteNullProperties(_dataToSave, true);
    stripProperties(_dataToSave, true);
    // deleteStructureProperties(_dataToSave);
    return _dataToSave;
  }

  // function deleteStructureProperties(data: any) {
  //   if (!isObject(data)) {
  //     return;
  //   }
  //
  //   deletePropertiesWithPrefix(data, (key: string) =>
  //     vm.schemaFormsBuildHelper.isStructureTag(key), true);
  // }

  /**
   * Handles save errors
   * @param result Error result
   */
  function saveErrorHandler(result: any) {
    if (!result) {
      return;
    }

    const error = result.error || result;
    const errorMessage = error.message || error;
    vm.saveError = errorMessage;

    toast.add({ severity: 'error', summary: 'Error Message', detail: `Failed ${errorMessage}`, life: 3000 });
  }

  /**
   * Clears obsolete fields from the data to save
   * @param dataToSave Data to save
   */
  function clearObsoleteFields(dataToSave: any) {
    let knownFields = vm.schemaFormsBuildHelper.schemaParser.getAllPaths();

    knownFields.push('title');
    knownFields.push('_id');
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

    const keys: Array<string> = _recListModelFields(dataToSave);

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

        setObjectPropertyByString(dataToSave, key, undefined);
      }
    });
  }

  /**
   * Initializes the form
   */
  function init() {
    vm.model = {};
    vm.formTarget = sharedFunctions.getTargetName();

    vm.editMode = sharedFunctions.isEditMode();

    getAllSettings(fields)
      .then(() => {
        schemaFormsProcessingHelper.registerForm(vm.name);
      })
      .then(() => {
        if (Object.keys(vm.model).length === 0) {
          vm.model = vm.schemaFormsBuildHelper.buildEmptyModel();
        }
      })
      .then(() => {
        return sharedFunctions.buildFormDescription(true);
      })// TODO: update useOneGroup
      .then((result: Array<Object>) => {
        formDescription.value = result;
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        vm.inProgress = false;
        initDone.value = true;
      });

    schemaFormsProcessingHelper.onFormUpdated(
      () => {
        const formIsChangedPrevValue = vm.formIsChanged;

        // TODO:

        // if (vm.initialModel) {
        //   const preparedModel = filterDataToSave();
        //
        //   vm.formIsChanged = !isEqual(JSON.stringify(vm.initialModel),
        //     JSON.stringify(preparedModel));
        // } else {
        //   vm.formIsChanged = true;
        // }
        //
        // if (formIsChangedPrevValue !== vm.formIsChanged) {
        //   //
        // }
        //
        // if (vm.isFormNotValid) {
        //   if (schemaFormsProcessingHelper.isFormValid(vm.name)) {
        //     vm.saveError = '';
        //     vm.isFormNotValid = false;
        //   }
        // }
        //
        // if (!vm.modelCopyToRestoreHistoryState) {
        //   vm.modelCopyToRestoreHistoryState = cloneDeep(vm.model);
        // }
      }
    );
  }

  /**
   * Gets all settings for the form
   * @param fields Optional fields configuration
   * @returns Promise resolving when all settings are loaded
   */
  async function getAllSettings(fields?: Object): Promise<any> {
    const promises = [sharedFunctions.getSchema(vm.editMode ? fields : undefined)];

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

  /**
   * Loads additional schema definitions
   * @param model Model data
   * @returns Promise resolving when additional definitions are loaded
   */
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

  /**
   * Finds additional schema definitions in the model
   * @param model Model data
   * @returns List of additional definitions to load
   */
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

  /**
   * Recursively lists all fields in the model
   * @param data Model data
   * @returns List of fields
   */
  function _recListModelFields(data: any) {
    const fields: any[] = [];

    for (const key in data) {
      const value = data[key];

      fields.push(key);

      if (isObject(value)) {  // && (!_.isArray(value))) {
        const innerFields = _recListModelFields(value);

        innerFields.forEach((field: string) => {
          fields.push(key + '.' + field);
        });
      }
    }

    return fields;
  }


  return {
    vm,
    formDescription,
    sharedFunctions,
    initDone,
  };
}
