// page number https://firebase.google.com/docs/firestore/query-data/query-cursors#paginate_a_query
// add files (with reference id)
// add log in

// change colors
// change header
// icons on form btns
// small green logos on header

const app = Vue.createApp({
    data(){
        return {
            topActiveBtn: 'none',
            logInEmail: '',
            logInPassword: '',
            startErrorMsg: '',
            searchErrorMsg: '',
            tableErrorMsg: '',
            formErrorMsg: '',
            userObj: {},
            userName: '',
            userEmail: '',
            startMenu: 'log-in',
            showAlert: false,
            showForm: false,
            isNewForm: true,
            stateList: [
                {id: 'new', name: 'New'},
                {id: 'pending', name: 'Pending'},
                {id: 'done', name: 'Done'},
                {id: 'cancelled', name: 'Cancelled'}
            ],
            formData: {
                date: '',
                time: '',
                organizer: '',
                attendee: '',
                state: '',
                // file: ''
            },
            searchData: {
                date: '',
                time: '',
                organizer: '',
                attendee: '',
                state: ''
            },
            tableDataList: [],
            checkedDataList: [],
            dbDataRef: '',
            templateDataList: [
                {
                    date: '2021-12-08',
                    time: '11:30',
                    timeAMPM: '11:30 AM',
                    organizer: 'BRANDON FLOWERS',
                    attendee: 'BERNARD SUMNER',
                    state: {id: 'new', name: 'New'},
                    // fileId: docData.fileId
                },
                {
                    date: '2021-11-22',
                    time: '08:00',
                    timeAMPM: '08:00 AM',
                    organizer: 'TOM PETTY',
                    attendee: 'DAVID BOWIE',
                    state: {id: 'done', name: 'Done'},
                    // fileId: docData.fileId
                },
                {
                    date: '2021-12-02',
                    time: '14:45',
                    timeAMPM: '02:45 PM',
                    organizer: 'KYLIE MINOGUE',
                    attendee: 'ED SHEERAN',
                    state: {id: 'pending', name: 'Pending'},
                    // fileId: docData.fileId
                },
                {
                    date: '2021-11-27',
                    time: '17:30',
                    timeAMPM: '05:30 PM',
                    organizer: 'EDDIE VEDDER',
                    attendee: 'DAVID BYRNE',
                    state: {id: 'cancelled', name: 'Cancelled'},
                    // fileId: docData.fileId
                }
            ]
        }
    },
    computed: {
        isActiveHoverAnimation(){
            return (this.topActiveBtn !== 'none')
        },
        showLogIn(){
            return (this.startMenu === 'log-in')
        },
        showCreateAccount(){
            return (this.startMenu === 'create-account')
        },
        showLogOut(){
            return (this.startMenu === 'log-out')
        },
        showStartErrorMsg(){
            return (this.startErrorMsg !== '')
        },
        showSearchErrorMsg(){
            return (this.searchErrorMsg !== '')
        },
        showTableErrorMsg(){
            return (this.tableErrorMsg !== '')
        },
        showFormErrorMsg(){
            return (this.formErrorMsg !== '')
        },
    },
    methods: {
        clearStartMenu(){
            this.startErrorMsg = ''
            this.logInEmail = ''
            this.logInPassword = ''
        },
        clearSearchFields(){
            this.searchData.date = ''
            this.searchData.time = ''
            this.searchData.organizer = ''
            this.searchData.attendee = ''
            this.searchData.state = ''

            this.searchErrorMsg = ''
        },
        validateEmail(string){
            return string.match(/[^@]+@[^@]+\.[^@]+/) ? true : false
        },
        validatePassword(string){
            return string.match(/^[A-Za-z]\w{7,15}$/) ? true : false
        },
        validateName(string){
            return ((string === '') || (string.match(/^[A-Za-z][A-Za-z ]{0,256}$/) ? true : false))
        },
        isSignedIn(){
            firebase.auth().onAuthStateChanged(user => {
                if (user){ //user && user.credential
                    // signed in
                    this.userObj = user
                    this.userName = this.userObj.displayName
                    this.userEmail = this.userObj.email
                    this.startMenu = 'log-out'
                    this.startErrorMsg = ''
                    this.searchErrorMsg = ''
                    this.tableErrorMsg = ''
                    this.getAllActiveData()
                } else {
                    this.logOut()
                    // not signed in
                    // unsubscribe
                    this.userObj = {}
                    this.userName = ''
                    this.userEmail = ''
                    this.startMenu = 'log-in'
                    this.startErrorMsg = ''
                    this.tableErrorMsg = ''
                    this.clearSearchFields()
                    this.closeForm()
                    this.tableDataList = this.templateDataList
                }
            })
        },
        createAccount(){
            const email = this.logInEmail
            const password = this.logInPassword
            if (this.validateEmail(email) && this.validatePassword(password)){
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((user) => {
                        if (user && user.credential){
                            // Signed in
                            this.userObj = user
                            if (user.additionalUserInfo.isNewUser){
                                this.addTemplateDataList()
                            }
                            this.clearStartMenu()
                        } else {
                            this.logOut()
                            this.userObj = {}
                            this.startErrorMsg = 'Error creating account, please try logging in with Google'
                        }
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(`Error ${errorCode}: ${errorMessage}`)
                        this.startErrorMsg = 'There appears to have been an error creating the account, please try again'
                    })
            } else {
                this.startErrorMsg = 'Please provide a valid email and a password between 8 to 16 characters (only letters, numbers and underscores) starting with a letter'
            }
        },
        logIn(){
            const email = this.logInEmail
            const password = this.logInPassword
            if (this.validateEmail(email) && this.validatePassword(password)){
                firebase.auth().signInWithEmailAndPassword(email, password)
                    .then((user) => {
                        if (user && user.credential){
                            // Signed in
                            this.userObj = user
                            this.clearStartMenu()
                        } else {
                            this.logOut()
                            this.userObj = {}
                            this.startErrorMsg = 'Error logging in, please try logging in with Google'
                        }
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(`Error ${errorCode}: ${errorMessage}`)
                        this.startErrorMsg = 'There appears to have been an error signing in to your account, please try again'
                    })
            } else {
                this.startErrorMsg = 'Please provide a valid email and password or log in with Google'
            }
        },
        googleLogIn(){
            const provider = new firebase.auth.GoogleAuthProvider()
            firebase.auth().signInWithPopup(provider)
                .then((user) => {
                    if (user){ //user && user.credential
                        if (user.additionalUserInfo.isNewUser){
                            this.addTemplateDataList()
                        }
                        this.clearStartMenu()
                    } else {
                        this.logOut()
                        this.userObj = {}
                        this.startErrorMsg = 'Error creating account, please try again'
                    }
                    
                })
        },
        logOut(){
            firebase.auth().signOut()
        },
        formatTimeItem(item){
            const string = String(item)
            let result
            if (string.length === 0){
                result = '00'
            } else if (string.length === 1){
                result = '0' + string
            } else {
                result = string
            }
            return result
        },
        getTimeAndDateFromTimestamp(timestamp){
            const datetime = new Date(timestamp.seconds*1000)

            const year = datetime.getFullYear()
            const month = this.formatTimeItem(datetime.getMonth() + 1)
            const day = this.formatTimeItem(datetime.getDate())
            const hour = this.formatTimeItem(datetime.getHours())
            const minute = this.formatTimeItem(datetime.getMinutes())

            const date = `${year}-${month}-${day}`
            const time = `${hour}:${minute}`

            return { time: time, date: date }
        },
        getTimestampFromTimeAndDate(time, date){
            const timeStr = String(time)
            const dateStr = String(date)
            const newDate = new Date()

            newDate.setFullYear(dateStr.substring(0, 4))
            newDate.setMonth(dateStr.substring(5, 7) - 1)
            newDate.setDate(dateStr.substring(8, 10))
            newDate.setHours(timeStr.substring(0, 2))
            newDate.setMinutes(timeStr.substring(3, 5))
            newDate.setSeconds(0)
            newDate.setMilliseconds(0)

            const timestamp = firebase.firestore.Timestamp.fromDate(newDate)
            return timestamp
        },
        convertDateToStorageFormat(date){
            // YYYY-MM-DD to YYYYMMDD
            const dateStr = String(date)
            return dateStr.substring(0, 4) + dateStr.substring(5, 7) + dateStr.substring(8, 10)
        },
        getDataFromDoc(doc){
            const docData = doc.data()
            const { time, date } = this.getTimeAndDateFromTimestamp(docData.datetime)
            const hour = parseInt(time.substring(0,2))
            const timeAMPM = ( hour < 12 ) ? `${time} AM` : (( hour == 12 ) ? `${time} PM` : `${this.formatTimeItem( hour - 12 )}:${time.substring(3, 5)} PM` )
            const registerDatetime = new Date(docData.registerDatetime.seconds*1000)
            const state = {id: docData.state, name: this.stateList.filter(stateItem => stateItem.id === docData.state)[0].name}
            const newData = {
                id: doc.id,
                date: date,
                time: time,
                timeAMPM: timeAMPM,
                organizer: docData.organizer,
                attendee: docData.attendee,
                state: state,
                // fileId: docData.fileId,
                registerDatetime: registerDatetime,
                registerUserId: docData.registerUserId
            }
            return newData
        },
        getSpecifiedData(dataRef){
            this.checkedDataList = []
            dataRef.where("uid", "==", this.userObj.uid).get()
                .then((querySnapshot) => {
                    this.tableDataList = []
                    querySnapshot.forEach((doc) => {
                        const newData = this.getDataFromDoc(doc)
                        this.tableDataList.push(newData)
                    })
                })
        },
        getAllActiveData(){
            const dataRef = firebase.firestore().collection('appointments').where('state', 'in', ['new', 'pending'])
            this.getSpecifiedData(dataRef)
        },
        getSearchedData(){
            this.searchErrorMsg = ''

            if (Object.keys(this.userObj).length !== 0){
                if (this.validateName(this.searchData.organizer) && this.validateName(this.searchData.attendee)){
                    let dataRef = firebase.firestore().collection('appointments')
                    
                    if (this.searchData.organizer){
                        dataRef = dataRef.where('organizer', '==', this.searchData.organizer?.toUpperCase())
                    }
                    if (this.searchData.attendee){
                        dataRef = dataRef.where('attendee', '==', this.searchData.attendee?.toUpperCase())
                    }
                    if (this.searchData.state){
                        dataRef = dataRef.where('state', '==', this.searchData.state.id)
                    }
                    if (this.searchData.date){
                        if (this.searchData.time){
                            const timestamp = this.getTimestampFromTimeAndDate(this.searchData.time, this.searchData.date)
                            dataRef = dataRef.where('datetime', '==', timestamp)
                        } else {
                            const dateStr = this.convertDateToStorageFormat(this.searchData.date)
                            dataRef = dataRef.where('date', '==', dateStr)
                        }
                    }
                    if (this.searchData.organizer == '' && this.searchData.attendee == '' && this.searchData.state == '' && this.searchData.date == ''){
                        dataRef = dataRef.orderBy("datetime", "desc")
                    }
    
                    this.getSpecifiedData(dataRef)
                } else {
                    this.searchErrorMsg = 'Names may only have letters and spaces, please correct organizer and/or attendee fields'
                }
            } else {
                this.searchErrorMsg = 'Please log in to search forms'
            }
        },
        closeAlert(){
            this.showAlert = false
        },
        closeForm(){
            this.showForm = false
            this.formErrorMsg = ''

            this.formData.date = '',
            this.formData.time = '',
            this.formData.organizer = '',
            this.formData.attendee = '',
            this.formData.state = ''
            // this.formData.file = ''
        },
        openNewForm(){
            if (Object.keys(this.userObj).length !== 0){
                this.tableErrorMsg = ''
                this.isNewForm = true
                this.showForm = true
            } else {
                this.tableErrorMsg = 'Please log in to create items'
            }
        },
        openModifyForm(){
            if (Object.keys(this.userObj).length !== 0){
                if (this.checkedDataList.length === 1){
                    const checkedData = this.checkedDataList[0]

                    this.formData.date = checkedData.date
                    this.formData.time = checkedData.time
                    this.formData.organizer = checkedData.organizer
                    this.formData.attendee = checkedData.attendee
                    this.formData.state = checkedData.state
                    // this.formData.file = checkedData.file

                    this.tableErrorMsg = ''
                    this.isNewForm = false
                    this.showForm = true

                } else if (this.checkedDataList.length === 0) {
                    this.tableErrorMsg = 'Select an item to modify'
                } else {
                    this.tableErrorMsg = 'Select only one item to modify'
                }
            } else {
                this.tableErrorMsg = 'Please log in to modify items'
            }
        },
        openAlertbox(){
            if (Object.keys(this.userObj).length !== 0){
                if (this.checkedDataList.length > 0){
                    this.tableErrorMsg = ''
                    this.showAlert = true

                } else {
                    this.tableErrorMsg = 'Select one or more items to delete'
                }
            } else {
                this.tableErrorMsg = 'Please log in to delete items'
            }
        },
        getFormDataInStorageFormat(dataItem){
            const dateObj = new Date()
            const currentTimestamp = firebase.firestore.Timestamp.fromDate(dateObj)
            const formData = {
                uid: this.userObj.uid,
                date: this.convertDateToStorageFormat(dataItem.date),
                datetime: this.getTimestampFromTimeAndDate(dataItem.time, dataItem.date),
                organizer: dataItem.organizer?.toUpperCase(),
                attendee: dataItem.attendee?.toUpperCase(),
                state: dataItem.state.id?.toLowerCase(),
                // fileId: this.formData.file,
                registerDatetime: currentTimestamp,
                registerUserId: this.userObj.uid
            }
            return formData
        },
        addTemplateDataList(){
            const dataRef = firebase.firestore().collection('appointments')
            this.templateDataList.forEach((templateData) => {
                dataRef.add(this.getFormDataInStorageFormat(templateData))
                .then(() => {
                    try {
                        this.getSearchedData() // try removing if causes error
                    } catch (error) {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        console.log(`Error ${errorCode}: ${errorMessage}`)
                    }
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(`Error ${errorCode}: ${errorMessage}`)
                    this.tableErrorMsg = 'There appears to have been an error adding the form example data'
                })
            })
        },
        updateCheckedDataState(stateId){
            this.tableErrorMsg = ''

            if (Object.keys(this.userObj).length !== 0){
                if (this.checkedDataList.length > 0){
                    const dataRef = firebase.firestore().collection('appointments')
                    this.checkedDataList.forEach((checkedData) => {
                        dataRef.doc(checkedData.id).update({
                            state: stateId
                        })
                        .then(() => {
                            this.getSearchedData()
                            this.checkedDataList = []
                            this.closeForm()
                        })
                    })
                } else {
                    this.tableErrorMsg = 'Select items to modify'
                }
                
            } else {
                this.tableErrorMsg = 'Please log in to modify items'
            }
        },
        submitNewForm(){
            const dataRef = firebase.firestore().collection('appointments')
            dataRef.add(this.getFormDataInStorageFormat(this.formData))
                .then(() => {
                    this.getSearchedData()
                    this.checkedDataList = []
                    this.closeForm()
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(`Error ${errorCode}: ${errorMessage}`)
                    this.formErrorMsg = 'There appears to have been an error adding the data, please check to see if it was not added and if not try again'
                })
        },
        submitModifyForm(){
            const checkedData = this.checkedDataList[0]
            const dataRef = firebase.firestore().collection('appointments')
            dataRef.doc(checkedData.id).update(this.getFormDataInStorageFormat(this.formData))
                .then(() => {
                    this.getSearchedData()
                    this.checkedDataList = []
                    this.closeForm()
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(`Error ${errorCode}: ${errorMessage}`)
                    this.formErrorMsg = 'There appears to have been an error modifying the data, please try again'
                })
        },
        submitForm(){
            this.formErrorMsg = ''
            
            if (this.validateName(this.formData.organizer) && this.validateName(this.formData.attendee)){
                if ((this.formData.date !== '') && (this.formData.time !== '') && (this.formData.organizer !== '') && (this.formData.attendee !== '') && (this.formData.state !== '')){
                    if (this.isNewForm === true){
                        this.submitNewForm()
                    } else {
                        this.submitModifyForm()
                    }
                } else {
                    this.formErrorMsg = 'Please fill all fields'
                }
            } else {
                this.formErrorMsg = 'Names may only have letters and spaces, please correct organizer and/or attendee fields'
            }
            
        },
        deleteSelectedItems(){
            const dataRef = firebase.firestore().collection('appointments')
            this.checkedDataList.forEach((checkedData) => {
                dataRef.doc(checkedData.id).delete()
                .then(() => {
                    this.getSearchedData()
                    this.checkedDataList = []
                    this.closeAlert()
                }).catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.log(`Error ${errorCode}: ${errorMessage}`)
                    this.tableErrorMsg = 'There appears to have been an error deleting the data, please try again'
                })
            })
        },
    },
    created(){
        this.isSignedIn()
    }
})
app.mount('#app')

/* function uploadFile(files){
    const storageRef = firebase.storage().ref()
    const imgRef = storageRef.child('img.jpg')

    const file = files.item(0)

    const task = imgRef.put(file)

    task.then(snapshot => {
        snapshot.ref.getDownloadURL()
            .then((url) => {
                document.querySelector('#imgUpload').setAttribute('src', url)
            })
    })
} */

/* function uploadFile(files){
    const imgRef = firebase.storage().ref().child('img.jpg')
    const file = files.item(0)

    imgRef.put(file).then(snapshot => {
        snapshot.ref.getDownloadURL()
            .then((url) => {
                document.querySelector('#imgUpload').setAttribute('src', url)
            })
    })
} */
