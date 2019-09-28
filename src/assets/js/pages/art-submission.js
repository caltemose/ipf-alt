import axios from 'axios'
import Dropzone from 'dropzone'
import serialize from 'form-serialize'

const FORM_ID = 'imagedrop'

let $form, $name, $phone, $email,
    dz,
    files = {}

const initialize = () => {
    initSelectors()
    initDropzone()
}

const initSelectors = () => {
    $name = document.querySelectorAll('input[name="artistName"]')[0]
    $phone = document.querySelectorAll('input[name="artistPhone"]')[0]
    $email = document.querySelectorAll('input[name="artistEmail"]')[0]

    $form = document.getElementById(FORM_ID)
    $form.addEventListener('submit', submitForm)
}

const initDropzone = () => {
    Dropzone.autoDiscover = false
    
    const config = {
        autoProcessQueue: false,
        previewsContainer: '.dz-previews-container',
        maxFilesize: 5,
        maxFiles: 3,
        acceptedFiles: 'image/*,application/pdf'
    }
    dz = new Dropzone(`#${FORM_ID}`, config)
    dz.on('complete', (file) => {
        onFileComplete(file)
    })
    dz.on('processing', (file) => {
        onFileProcessing(file)
    })
    dz.on('sending', (file) => {
        onFileSending(file)
    })
    dz.on('addedfile', (file) => {
        onFileAdded(file)
    })

    console.log(dz)
}

const onFileAdded = (file) => {
    const uuid = file.upload.uuid
    files[uuid] = {
        name: file.name,
        added: true
    }
}

const onFileProcessing = (file) => {
    const uuid = file.upload.uuid
    if (files[uuid]) {
        files[uuid].processing = true
    }
}

const onFileSending = (file) => {
    const uuid = file.upload.uuid
    if (files[uuid]) {
        files[uuid].sending = true
    }
}

const onFileComplete = (file) => {
    // console.log(formData)
    // console.log(serialize($form))

    // TODO check for non-JSON responses
    const response = JSON.parse(file.xhr.response)
    const uuid = file.upload.uuid
    if (files[uuid]) {
        files[uuid].complete = true
        files[uuid].url = response.http_referer + response.file
    }
    if (allFilesComplete()) {
        let formData = {}
        formData.artistName = $name.value
        formData.artistPhone = $phone.value
        formData.artistEmail = $email.value
        formData.images = getImages()

        // let serialized = ''
        // serialized += `artistName=${$name.value}&artistPhone=${$phone.value}&artistEmail=${$email.value}`
        // serialized += `&images=${getImages().join(',')}`

        axios
            .post('submit.php', formData)
            .then(res => {
                console.log(res)
                hideLoadingState()
                showResults()
            })
            .catch(err => console.log(err))
    }
}

const hideLoadingState = () =>{
    document.getElementById('submissionLoader').style.display = 'none'
}

const showLoadingState = () =>{
    document.getElementById('submissionLoader').style.display = 'block'
}

const showResults = () => {
    document.getElementById('formContainer').style.display = 'none'
    document.getElementById('formResults').style.display = 'block'
}

const submitForm = (event) => {
    event.preventDefault()

    let isValid = true
    let errorMsg = '<p>Please correct the errors with your form: '
    
    if ($name.value.length < 3) {
        isValid = false
        errorMsg += 'You must submit a name. '
    }
    if (!phoneIsValid($phone.value) && !emailIsValid($email.value)) {
        isValid = false
        errorMsg += 'You must submit either a valid phone number or email address. '
    }
    if (dz.getQueuedFiles() < 1) {
        isValid = false
        errorMsg += 'You must submit at least one art file.'
    }
    errorMsg += '</p>'

    if (isValid) {
        showLoadingState()
        dz.processQueue()
    } else {
        console.error('invalid form')
        const $formError = document.querySelectorAll('.ArtForm-error')[0]
        $formError.innerHTML = errorMsg
    }

}

const phoneIsValid = (phone) => phone.length > 10

const emailIsValid = (email) => {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return email.match(emailRegex)
}

const getImages = () => {
    var images = []
    var keys = Object.keys(files)
    for(var i=0; i<keys.length; i++) {
        images.push(files[keys[i]].url)
    }
    return images
}

const allFilesComplete = () => {
    const keys = Object.keys(files)
    if (keys) {
        for(var i=0; i<keys.length; i++) {
            if (!files[keys[i]].complete) {
                return false
            }
        }
        return true
    } else {
        return null
    }
}

initialize()
