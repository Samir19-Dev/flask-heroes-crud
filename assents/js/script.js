const apiUrl = 'http://localhost:5000/api/heroes';

const titulo = document.getElementById("form-titulo");
const createHeroBtn = document.getElementById('btn-crear');
const listHeroesBtn = document.getElementById('btn-listar');
const createHeroForm = document.getElementById('form-hero');
const heroesContainer = document.getElementById('heroes-container');

createHeroBtn.addEventListener('click', () => {
    resetearFormulario();
    createHeroForm.style.display = 'block';
    createHeroForm.classList.remove('d-none');
    heroesContainer.classList.add('d-none');
    titulo.textContent = "Agregar Héroe";
});

listHeroesBtn.addEventListener('click', () => {
    createHeroForm.style.display = 'none';
    createHeroForm.classList.add('d-none');
    heroesContainer.classList.remove('d-none');
    obtenerHeroes();
});

async function obtenerHeroes() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Error al obtener héroes');
        const heroes = await response.json();
        mostrarHeroes(heroes);
    } catch (error) {
        console.error('Error al obtener héroes:', error);
        heroesContainer.innerHTML = '';
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('alert', 'alert-danger');
        alertDiv.textContent = 'Error al cargar los héroes';
        heroesContainer.appendChild(alertDiv);
    }
}

function mostrarHeroes(heroes) {
    heroesContainer.innerHTML = '';
    heroes.forEach(hero => {
        const card = document.createElement('div');
        card.classList.add('col-md-4', 'mb-4');
        const cardContent = document.createElement('div');
        cardContent.classList.add('card');

        const img = document.createElement('img');
        img.src = hero.image;
        img.classList.add('card-img-top', 'hero-image');
        img.alt = hero.name;

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const title = document.createElement('h5');
        title.classList.add('card-title');
        title.textContent = hero.name;

        const skill = document.createElement('p');
        skill.classList.add('card-text');
        skill.innerHTML = `<strong>Habilidad:</strong> ${hero.skill}`;

        const company = document.createElement('p');
        company.classList.add('card-text');
        company.innerHTML = `<strong>Compañía:</strong> ${hero.company}`;

        const genero = document.createElement('p');
        genero.classList.add('card-text');
        genero.innerHTML = `<strong>Género:</strong> ${hero.genero}`;

        const descripcionDiv = document.createElement('div');
        descripcionDiv.classList.add('descripcion');
        const descripcionTitle = document.createElement('strong');
        descripcionTitle.textContent = 'Descripción:';
        const descripcionText = document.createElement('p');
        descripcionText.textContent = hero.descripcion;
        descripcionDiv.appendChild(descripcionTitle);
        descripcionDiv.appendChild(descripcionText);

        const editButton = document.createElement('button');
        editButton.classList.add('btn', 'btn-primary', 'me-2');
        editButton.onclick = () => prepararEdicion(hero.id);
        editButton.innerHTML = `<i class="fas fa-edit"></i> Editar`;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.onclick = () => eliminarHero(hero.id);
        deleteButton.innerHTML = `<i class="fas fa-trash-alt"></i> Eliminar`;

        cardBody.appendChild(title);
        cardBody.appendChild(skill);
        cardBody.appendChild(company);
        cardBody.appendChild(genero);
        cardBody.appendChild(descripcionDiv);
        cardBody.appendChild(editButton);
        cardBody.appendChild(deleteButton);

        cardContent.appendChild(img);
        cardContent.appendChild(cardBody);
        card.appendChild(cardContent);
        heroesContainer.appendChild(card);
    });
}

async function agregarHeroe() {
    const nuevoHeroe = {
        name: document.getElementById('nombre').value,
        skill: document.getElementById('habilidad').value,
        image: document.getElementById('imagen').value,
        company: document.getElementById('compania').value,
        genero: document.getElementById('genero').value,
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoHeroe)
        });

        if (!response.ok) throw new Error('Error al agregar héroe');

        resetearFormulario();
        obtenerHeroes();
        listHeroesBtn.click();
    } catch (error) {
        console.error('Error al agregar héroe:', error);
        alert('Error al agregar el héroe');
    }
}

async function prepararEdicion(id) {
    try {
        const heroData = await obtenerHero(id);
        createHeroForm.style.display = 'block';
        createHeroForm.classList.remove('d-none');
        heroesContainer.classList.add('d-none');


        document.getElementById('nombre').value = heroData.name;
        document.getElementById('habilidad').value = heroData.skill;
        document.getElementById('imagen').value = heroData.image;
        document.getElementById('compania').value = heroData.company;
        document.getElementById('genero').value = heroData.genero;
        document.getElementById('descripcion').value = heroData.descripcion;


        const boton = document.getElementById('boton-guardar');
        titulo.textContent = "Actualizar Héroe";
        boton.textContent = "Actualizar Héroe";
        boton.onclick = () => actualizarHeroe(id);
    } catch (error) {
        console.error('Error al preparar edición:', error);
        alert('Error al cargar los datos del héroe');
    }
}

async function obtenerHero(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`);
        if (!response.ok) throw new Error('Error al obtener héroe');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener héroe:', error);
        throw error;
    }
}

async function actualizarHeroe(id) {
    const heroActualizado = {
        name: document.getElementById('nombre').value,
        skill: document.getElementById('habilidad').value,
        image: document.getElementById('imagen').value,
        company: document.getElementById('compania').value,
        genero: document.getElementById('genero').value,
        descripcion: document.getElementById('descripcion').value
    };

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heroActualizado)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error al actualizar héroe: ${errorData.message}`);
        }

        resetearFormulario();
        obtenerHeroes();
        listHeroesBtn.click();
    } catch (error) {
        console.error('Error al actualizar héroe:', error);
        alert('Error al actualizar el héroe: ' + error.message);
        console.log('Detalles del error:', error);
    }
}

async function eliminarHero(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este héroe?')) return;

    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar héroe');

        obtenerHeroes();
    } catch (error) {
        console.error('Error al eliminar héroe:', error);
        alert('Error al eliminar el héroe');
    }
}

function resetearFormulario() {
    createHeroForm.reset();
    const boton = document.getElementById('boton-guardar');
    boton.textContent = "Agregar Héroe";
    boton.onclick = agregarHeroe;
    titulo.textContent = "Agregar Héroe";
    createHeroForm.classList.add('d-none');
}

document.getElementById('boton-guardar').onclick = agregarHeroe;

document.addEventListener('DOMContentLoaded', () => {
    createHeroForm.classList.add('d-none');
    obtenerHeroes();
});
