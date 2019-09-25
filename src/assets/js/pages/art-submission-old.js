(function ($) {

    var $form, artDropZone, files = {}

    function submitForm (event) {
        var $name = $('input[name="artistName"]')
        var $phone = $('input[name="artistPhone"]')
        var $email = $('input[name="artistEmail"]')

        var isValid = true
        var errorMsg = '<p>Please correct the errors with your form: '
        if ($name.val().length < 3) {
            isValid = false
            errorMsg += 'You must submit a name. '
        }
        if (!phoneIsValid($phone.val()) && !emailIsValid($email.val())) {
            isValid = false
            errorMsg += 'You must submit either a valid phone number or email address. '
        }
        if (artDropZone.getQueuedFiles() < 1) {
            isValid = false
            errorMsg += 'You must submit at least one art file.'
        }
        errorMsg += '</p>'
        event.preventDefault()
        if (isValid) {
            showLoadingState()
            artDropZone.processQueue()
        } else {
            console.error('invalid form')
            $('.ArtForm-error').html(errorMsg)
        }
    }

    function phoneIsValid (phone) {
        return phone.length > 10
    }

    function emailIsValid (email) {
        var emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return email.match(emailRegex)
    }

    function initialize () {
        Dropzone.autoDiscover = false
        var dzOptions = {
            autoProcessQueue: false,
            previewsContainer: '.dz-previews-container',
            maxFilesize: 5,
            maxFiles: 3,
            acceptedFiles: 'image/*,application/pdf'
        }
        $form = $('#imagedrop')
        $form.submit(submitForm)

        artDropZone = new Dropzone("#imagedrop", dzOptions);
        artDropZone.on('complete', function (file) {
          onFileComplete(file)
        })
        artDropZone.on('processing', function (file) {
          onFileProcessing(file)
        })
        artDropZone.on('sending', function (file) {
          onFileSending(file)
        })
        artDropZone.on('addedfile', function (file) {
          onFileAdded(file)
        })
    }

    function showLoadingState () {
        $('#submissionLoader').show()
    }

    function onFileAdded (file) {
        var uuid = file.upload.uuid
        files[uuid] = {
            name: file.name,
            added: true
        }
    }

    function onFileProcessing (file) {
        var uuid = file.upload.uuid
        if (files[uuid]) {
            files[uuid].processing = true
        }
    }

    function onFileSending (file) {
        var uuid = file.upload.uuid
        if (files[uuid]) {
            files[uuid].sending = true
        }
    }

    function onFileComplete (file) {
        var response = JSON.parse(file.xhr.response)
        var uuid = file.upload.uuid
        if (files[uuid]) {
            files[uuid].complete = true
            files[uuid].url = response.http_referer + response.file
        }
        if (allFilesComplete()) {
            var formData = {}
            formData.artistName = $('input[name="artistName"]').val()
            formData.artistPhone = $('input[name="artistPhone"]').val()
            formData.artistEmail = $('input[name="artistEmail"]').val()
            formData.images = getImages()
            $.post('submit.php', formData, function (res) {
                $('#submissionLoader').hide()
                showResults()
            })
        }
    }

    function showResults () {
        $('#formContainer').hide()
        $('#formResults').show()
    }

    function getImages () {
        var prefix = 'http://inmanparkfestival.com/art/submissions/uploads/'
        var images = []
        var keys = Object.keys(files)
        for(var i=0; i<keys.length; i++) {
            images.push(files[keys[i]].url)
        }
        return images
    }

    function allFilesComplete () {
        var keys = Object.keys(files)
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
})(window.jQuery)
