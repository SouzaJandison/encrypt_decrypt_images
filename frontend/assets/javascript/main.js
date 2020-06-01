const $form = document.querySelector('#form')
const $option = document.querySelector('#options')
const $password = document.querySelector('#password')
const $image = document.querySelector('#image')
const $btn = document.querySelector('.btn')
const $result = document.querySelector('#result')

function handlerOption() {
    $btn.innerHTML = ''
    $option.value === 'encrypt' ? $btn.innerHTML = 'Criptografar' : $btn.innerHTML = 'Descriptografar'
}

$form.addEventListener('submit', function(event) {
    event.preventDefault();

    if($password.value === '') return alert('digite uma senha!!!')
    if($image.files.length === 0) return alert('escolha uma imagem!!!')

    const data = new FormData()
    data.append('option', $option.value)
    data.append('password', $password.value)
    data.append('file', $image.files[0])

    fetch('http://localhost:8000/', {
        method: 'POST',
        body: data
    })
    .then((response) => {
        return response.json()
    })
    .then((resp) => {
        console.log(resp)
        $result.href = resp.url;
        $result.download = resp.name
        $result.innerHTML = 'Baixa Arquivo'
    })
    .catch((error) => {
        console.log(error)
    })
})
