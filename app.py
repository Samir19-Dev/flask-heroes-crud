from flask import Flask, jsonify, request  # Flask para la API y JSON para las respuestas
from flask_cors import CORS  # Permitir solicitudes desde diferentes dominios (CORS)
import pymysql.cursors  # Conector MySQL
import config  # Archivo de configuración separado para las credenciales de MySQL

# Inicialización de la aplicación Flask
app = Flask(__name__)

# Habilitar CORS para permitir solicitudes desde otros dominios
CORS(app)

# Configuración de la conexión con MySQL desde un archivo externo 'config.py' 
app.config['MYSQL_HOST'] = config.MYSQL_HOST
app.config['MYSQL_USER'] = config.MYSQL_USER
app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
app.config['MYSQL_DB'] = config.MYSQL_DB

# Inicializamos MySQL con la configuración de la aplicación Flask
mysql = pymysql.connect(
    host=app.config['MYSQL_HOST'],
    port=3306,
    user=app.config['MYSQL_USER'],
    passwd=app.config['MYSQL_PASSWORD'],
    db=app.config['MYSQL_DB'],
    cursorclass=pymysql.cursors.DictCursor  # Devuelve los resultados como diccionarios
)

# Ruta GET: Obtener todos los héroes de la base de datos
@app.route('/api/heroes', methods=['GET'])
def get_heroes():
    """
    Recupera todos los héroes de la tabla 'heroes' y los devuelve como JSON.
    """
    try:
        cursor = mysql.cursor()  # Inicializa el cursor
        cursor.execute('SELECT * FROM heroes')  # Ejecuta la consulta SQL
        heroes = cursor.fetchall()  # Recupera todas las filas
        
        # Construimos la lista de héroes en formato JSON usando los nombres de columnas
        result = [
            {
                'id': hero['id'],
                'name': hero['name'],
                'skill': hero['skill'],
                'image': hero['image'],
                'company': hero['company'],
                'genero': hero['genero'],
                'descripcion': hero['descripcion']
            }
            for hero in heroes
        ]
        
        cursor.close()  # Cierra el cursor
        return jsonify(result), 200  # Devolvemos el resultado como JSON

    except pymysql.MySQLError as e:
        print(f"Error en MySQL: {e}")
        return jsonify({'error': 'Error al recuperar héroes'}), 500

# Ruta GET: Obtener un héroe específico por su ID
@app.route('/api/heroes/<int:id>', methods=['GET'])
def get_hero(id):
    """
    Recupera un héroe por su ID.
    """
    cursor = mysql.cursor()  # Inicializa el cursor
    cursor.execute('SELECT * FROM heroes WHERE id = %s', (id,))  # Consulta SQL con parámetro
    hero = cursor.fetchone()  # Obtiene un solo héroe
    if hero:
        result = {
            'id': hero['id'],
            'name': hero['name'],
            'skill': hero['skill'],
            'image': hero['image'],
            'company': hero['company'],
            'genero': hero['genero'],
            'descripcion': hero['descripcion']
        }
        return jsonify(result), 200  # Respuesta con estado 200 si el héroe existe
    return jsonify({'error': 'Héroe no encontrado'}), 404  # Estado 404 si no existe

# Ruta POST: Agregar un nuevo héroe
@app.route('/api/heroes', methods=['POST'])
def add_hero():
    """
    Agrega un nuevo héroe con sus datos al sistema.
    """
    data = request.get_json()  # Obtenemos los datos del cuerpo de la solicitud en formato JSON
    name = data.get('name')
    skill = data.get('skill')
    image = data.get('image')
    company = data.get('company')
    genero = data.get('genero')
    descripcion = data.get('descripcion')
    
    # Verificamos si los campos necesarios están presentes
    if not name or not skill or not image or not company or not genero or not descripcion:
        return jsonify({'error': 'Todos los campos son requeridos'}), 400

    cursor = mysql.cursor()  # Inicializa el cursor
    cursor.execute('INSERT INTO heroes (name, skill, image, company, genero, descripcion) VALUES (%s, %s, %s, %s, %s, %s)', 
                   (name, skill, image, company, genero, descripcion))  # Inserta el nuevo héroe
    mysql.commit()  # Confirma los cambios en la base de datos
    return jsonify({'message': 'Héroe agregado exitosamente'}), 201  # Estado 201: Recurso creado

# Ruta PUT: Actualizar un héroe existente
@app.route('/api/heroes/<int:id>', methods=['PUT'])
def update_hero(id):
    """
    Actualiza los datos de un héroe por su ID.
    """
    data = request.get_json()
    name = data.get('name')
    skill = data.get('skill')
    image = data.get('image')
    company = data.get('company')
    genero = data.get('genero')
    descripcion = data.get('descripcion')

    cursor = mysql.cursor()  # Inicializa el cursor
    cursor.execute('SELECT * FROM heroes WHERE id = %s', (id,))  # Verificamos si el héroe existe
    hero = cursor.fetchone()
    if not hero:
        return jsonify({'error': 'Héroe no encontrado'}), 404

    # Actualizamos el héroe en la base de datos
    cursor.execute('UPDATE heroes SET name = %s, skill = %s, image = %s, company = %s, genero = %s, descripcion = %s WHERE id = %s', 
                   (name, skill, image, company, genero, descripcion, id))
    mysql.commit()  # Confirmamos los cambios
    return jsonify({'message': 'Héroe actualizado exitosamente'}), 200

# Ruta DELETE: Eliminar un héroe por ID
@app.route('/api/heroes/<int:id>', methods=['DELETE'])
def delete_hero(id):
    """
    Elimina un héroe por su ID.
    """
    cursor = mysql.cursor()  # Inicializa el cursor
    cursor.execute('SELECT * FROM heroes WHERE id = %s', (id,))  # Verifica si el héroe existe
    hero = cursor.fetchone()
    if not hero:
        return jsonify({'error': 'Héroe no encontrado'}), 404

    cursor.execute('DELETE FROM heroes WHERE id = %s', (id,))
    mysql.commit()  # Confirma los cambios
    return jsonify({'message': 'Héroe eliminado exitosamente'}), 200
    
if __name__ == '__main__':
    app.run(debug=True)

