import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import Fingerprint from 'express-fingerprint'
const fileUpload = require('express-fileupload');
import { AuthRouter } from './routers/Auth'
import TokenService from "./services/Token";
import { EventsRouter } from "./routers/Events";
import { JournalRouter } from "./routers/Journal";
import { ReferencesRouter } from "./routers/References";

dotenv.config()

const PORT = process.env.PORT ?? 8080
const CLIENT_URL = process.env.CLIENT_URL

const app = express()

app.use(cookieParser());
app.use(express.json());
app.use(fileUpload({}));
app.use(cors({ credentials: true, origin: CLIENT_URL }));
// Уникальный набор данных об устройстве пользователя
app.use(
    Fingerprint({
        // @ts-ignore
        parameters: [Fingerprint.useragent, Fingerprint.acceptHeaders],
    })
);

// Авторизация
app.use('/auth', AuthRouter)
// Календарь
app.use('/calendar', EventsRouter)
// Журнал
app.use('/journal', JournalRouter)
// Справочники
app.use('/references', ReferencesRouter)

// app.use('/resource/protected', TokenService.checkAccess, (req, res) => {
//     return res.status(200).json("Добро пожаловать")
// })

app.listen(PORT, () => {
    console.log(`Server started on ${PORT}`)
})
