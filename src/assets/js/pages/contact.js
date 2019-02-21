import axios from 'axios'
import serialize from 'form-serialize'

let $form
let $successMessage
let $name
let $email
let $recipient
let $message

const initialize = (form) => {
    $form = document.getElementById(form)
    $successMessage = document.getElementById('successMessage')
    $name = $form.querySelector('[name="name"]')
    $email = $form.querySelector('[name="email"]')
    $recipient = $form.querySelector('[name="recipient"]')
    $message = $form.querySelector('[name="message"]')

    $form.addEventListener('submit', onFormCheck)
}

const onFormCheck = (event) => {
    event.preventDefault()
    let valid = true
    if ($name.value.length < 2) {
        valid = false
    }
    if (!isValidEmail($email.value)) {
        valid = false
    }
    if ($recipient.value.length < 1) {
        valid = false;
    }
    if ($message.value.length < 2) {
        valid = false;
    }
    if (valid) {
        submitAjaxForm();
    } else {
        alert('You must fill out all fields with valid values.');
    }
}

const isValidEmail = (str) => {
    return str.length > 5
}

const hideElement = (el) => {
    el.style.display = 'none'
}

const showElement = (el) => {
    el.style.display = 'block'
}

const submitAjaxForm = () => {
    axios
        .post('/contact-us/contact.php', serialize($form))
        .then(res => {
            console.log(res)
            hideElement($form)
            showElement($successMessage)
        })
        .catch(err => console.log(err))
}

initialize('ContactForm')
