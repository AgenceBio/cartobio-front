import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

//init store
const store =  new Vuex.Store({
    state: {
        currentYear: 2020,
        userProfile: {},
        currentOperator: {},
        disclaimer: true,
        userCategory: {},
        editMode: false,
        categories : {admin: "Admin", oc: "OC", agri: "Agri", other: "Autre"}
    },
    getters: {
        getCurrentYear: state => state.currentYear,
        getProfile: state => state.userProfile,
        getOperator: state => state.currentOperator,
        getDisclaimer: state => state.disclaimer,
        getUserCategory: state => state.userCategory,
        getEditMode: state => state.editMode,
        getCategories: state => state.categories
    },
    mutations: {
        setUser(state, profile) {
            state.userProfile = profile;
        },
        setOperator(state, operator) {
            state.currentOperator = operator;
        },
        setDisclaimer(state, bool) {
            state.disclaimer = bool;
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
