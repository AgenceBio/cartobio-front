import Vue from 'vue'
import Vuex from 'vuex'

import user from '@/store/modules/user.js';
import operators from '@/store/modules/operators.js';

Vue.use(Vuex)

//init store
const store =  new Vuex.Store({
    modules: {
      operators,
      user,
    },
    state: {
        lastDataUpdate: '2019-05-15',
        currentYear: 2020,
        userProfile: {},
        currentOperator: {},
        userCategory: {},
        editMode: false,
        categories : {admin: "Admin", oc: "OC", agri: "Agri", other: "Autre"}
    },
    getters: {
        getCurrentYear: state => state.currentYear,
        getProfile: state => state.userProfile,
        getOperator: state => state.currentOperator,
        getUserCategory: state => state.userCategory,
        getEditMode: state => state.editMode,
        getCategories: state => state.categories
    },
    mutations: {
        resetUser(state) {
          state.userProfile = {}
          state.userCategory = {}
          state.currentOperator = {}
          state.editMode = false
        },

        setUser(state, profile) {
            state.userProfile = profile;
        },
        setOperator(state, operator) {
            state.currentOperator = operator;
        },
        // category: role categories retrieved from the notifications portail API
        setUserCategory(state, category) {
            let userCat = this.state.categories.other;
            // This allow a simpler change in case of notification API change.
            switch (category) {
                case "Super OC":
                case "OC":
                    userCat = this.state.categories.oc;
                    break;
                case "Admin":
                    userCat = this.state.categories.admin;
            }
            state.userCategory = userCat;
        },
        setEditMode(state, bool) {
            state.editMode = bool;
        }
    }
})

export default store
