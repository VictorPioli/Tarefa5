const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Inicialize o Firebase Admin SDK
const serviceAccount = require('./firebaseConfig.json');
const { constrainedMemory } = require('process');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const usersCollection = db.collection('users');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let loggedInUserId = null;

async function verifyAuth(req, res, next) {
    const authorizationHeader = req.headers['authorization'];
    if (authorizationHeader) {
        const token = authorizationHeader.split(' ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            const userDoc = await db.collection('users').doc(decodedToken.uid).get();
            if (userDoc.exists) {
                req.user = userDoc.data();
                req.user.uid = decodedToken.uid;
                loggedInUserId = decodedToken.uid; // Armazenar o ID do usuário logado
                return next();
            }
        } catch (error) {
            console.error('Erro na verificação de token:', error);
        }
    }
    res.status(401).json({ success: false, message: 'Não autorizado' });
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'acesso.html'));
});

app.post('/receber', async (req, res) => {
    const { email, password } = req.body;
    try {
        const querySnapshot = await usersCollection.where('email', '==', email).where('password', '==', password).get();

        if (querySnapshot.empty) {
            console.log("Email ou senha inválidos");
            return res.status(401).json({ success: false, message: "Email ou senha inválidos" });
        } else {
            docId = querySnapshot.docs[0].id;
            console.log(docId);

            // Determine se o usuário é admin ou não (você precisa implementar essa lógica)
            const isAdmin = false; // ou true, dependendo da lógica de autenticação/admin

            const redirectUrl = isAdmin ? '/admin' : '/escolhas';
            return res.json({ success: true, redirectUrl: redirectUrl });
        }
    } catch (error) {
        console.error("Erro ao verificar credenciais:", error);
        return res.status(500).json({ success: false, message: "Erro ao verificar credenciais" });
    }
});

app.get('/dados', (req, res) => {
    res.send('Esta é a resposta do servidor para a chamada AJAX.');
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/escolhas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'escolhas.html'));
});

app.get('/opcao1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opcao1.html'));
});

app.get('/opcao2', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opcao2.html'));
});

app.get('/opcao3', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'opcao3.html'));
});

app.post('/send', async (req, res) => {
    const { iniciante1, iniciante2, iniciante3 } = req.body;

    // Cria um objeto de atualização sem valores undefined
    const updateData = {};
    if (iniciante1 !== undefined) updateData.iniciante1 = iniciante1;
    if (iniciante2 !== undefined) updateData.iniciante2 = iniciante2;
    if (iniciante3 !== undefined) updateData.iniciante3 = iniciante3;

    try {
        await db.collection('users').doc(docId).update(updateData);
        return res.json('Códigos enviados com sucesso');
    } catch (error) {
        console.error("Erro ao enviar códigos:", error);
        return res.status(500).json({ error: "Erro ao enviar códigos" });
    }
});

app.post('/send-challenges-intermediate', async (req, res) => {
    const { intermediario1, intermediario2, intermediario3 } = req.body;

    // Cria um objeto de atualização sem valores undefined
    const updateData = {};
    if (intermediario1 !== undefined) updateData.intermediario1 = intermediario1;
    if (intermediario2 !== undefined) updateData.intermediario2 = intermediario2;
    if (intermediario3 !== undefined) updateData.intermediario3 = intermediario3;

    try {
        await db.collection('users').doc(docId).update(updateData);
        return res.json('Códigos enviados com sucesso');
    } catch (error) {
        console.error("Erro ao enviar códigos:", error);
        return res.status(500).json({ error: "Erro ao enviar códigos" });
    }
});

app.post('/send-challenges-avancado', async (req, res) => {
    const { avancado1, avancado2, avancado3 } = req.body;

    // Cria um objeto de atualização sem valores undefined
    const updateData = {};
    if (avancado1 !== undefined) updateData.avancado1 = avancado1;
    if (avancado2 !== undefined) updateData.avancado2 = avancado2;
    if (avancado3 !== undefined) updateData.avancado3 = avancado3;

    try {
        await db.collection('users').doc(docId).update(updateData);
        return res.json('Códigos enviados com sucesso');
    } catch (error) {
        console.error("Erro ao enviar códigos:", error);
        return res.status(500).json({ error: "Erro ao enviar códigos" });
    }
});

// Adiciona o endpoint de registro
app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    admin.auth().createUser({
        email: email,
        password: password
    })
        .then((userRecord) => {
            db.collection('users').doc(userRecord.uid).set({
                email: email,
                password: password
            })
                .then(() => {
                    console.log("Uhuuu")
                })
            console.log('Usuário criado com sucesso', userRecord.uid);
        })
        .catch((error) => {
            console.error('Erro ao criar usuário:', error);
        });
    return res.json("tudo certo")
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
