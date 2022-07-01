import dotenv from "dotenv";
//читаем env
dotenv.config()
import {body, param, check, header, cookie,query} from "express-validator";
import express, {Request,Response,NextFunction} from "express";
import {validationResult, checkSchema } from "express-validator";
import cookieParser from 'cookie-parser';
const app = express();
app.use(express.urlencoded({extended:true}))
app.use(express.json());
app.use(cookieParser());
//подключаем шаблонизатор
app.set("view engine","ejs")

function authMiddleware(req: Request, res:Response, next: NextFunction) {

    if (false) {
        next(new Error("Пользователь не авторизован!"));
    }
    next();
}

type RequestBody<T> = Request<{}, {}, T>;



interface FormBody {
    text: string,
    number: string,
    date: string,
    color: string,
    email: string,
    password: string,
    confirmPassword: string,
    range: string,
    language: string,
    ide: string | string[],
    pets: string | string[],
    story:string
};
const formValidationSchema = [
    body('text').notEmpty().withMessage('Поле пусто').custom(value=>true).withMessage(`Ошибка если валидатор возвращает false`),
    body('number').isNumeric().withMessage('Необходимо число'),
    body('date').isDate().withMessage("некорректный формат даты"),
    body('color').isHexColor().withMessage("Некорректный формат цвета"),
    body('email').isEmail().withMessage("Некорректный формат email"),
    body('password').isLength({min: 5, max: 32}).withMessage("Некорректная длина пароля"),
    body('confirmPassword').custom((value,{req})=>{
        if (value !== req.body.password) {
            throw new Error('Пароли не совпадают');
        }
        return true;
    }),
    body('range').isNumeric().withMessage("диапазон не является числом").custom(value=>{
        const range =Number(value);
        if (range < 0 || range > 100 || range % 10 != 0){
            return false;
        }
        return true;
    }).withMessage("Некорректный формат диапазона"),
    body('language').notEmpty().withMessage('Язык пуст'),
    body('ide').notEmpty().withMessage('Ide не выбрана').custom(value=>{
        if (Array.isArray(value)){
            return value.every(el=>el.startsWith('v'))
        }
        return value.startsWith('v');
    }).withMessage('Не все элементы массива начинаются с v'),
    //срабатывает только когда pets массив, для одиночных значений не работает
    body('pets.*').notEmpty().withMessage('Pets не выбраны').custom(value=>{
        console.log(value);
        if (!['dog', 'cat'].includes(value)) return false
        return true;
    }).withMessage('Не все элементы массива допустимы'),
    body('pets').notEmpty().withMessage('Pets не выбраны').custom(value=>{
        console.log(value);
        if (!Array.isArray(value) && !['dog', 'cat'].includes(value)) return false
        return true;
    }).withMessage('Не все элементы массива допустимы'),
    body('story').notEmpty().withMessage('Напишите историю')
]

const formValidationExpressSchema = {
    text: {
        notEmpty: {
            errorMessage: 'Поле пусто',
        },
        custom: {
            options: (value:any) => {
                return true;
              },
            errorMessage: 'Ошибка если валидатор возвращает false'
        }
    },
    number: {
        isNumeric: {
            errorMessage: 'Необходимо число'
        }
    },
    date: {
        isDate: {
            errorMessage: 'Некорректный формат даты'
        }
    },
    color: {
        isHexColor: {
            errorMessage: 'Некорректный формат цвета'
        }
    },
    email: {
        isEmail: {
            errorMessage: 'Некорректный формат email'
        }
    },
    password: {
        isLength: {
            errorMessage: 'Некорректная длина пароля',
            options: {min: 5, max: 32}
        }
    },
    confirmPassword: {
        custom: {
            options: (value:any,{req}:any)=>{
                if (value !== req.body.password) {
                    throw new Error('Пароли не совпадают');
                }
                return true;
            }
        }
    },
    range: {
        isNumeric: {
            errorMessage: 'Диапазон не является числом'
        },
        custom: {
            options: (value:any)=>{
                const range =Number(value);
                if (range < 0 || range > 100 || range % 10 != 0){
                    return false;
                }
                return true;
            },
            errorMessage: 'Некорректный формат диапазона',

        }
    },
    language: {
        notEmpty: {
            errorMessage: 'Язык пуст',
        },
    },
    ide: {
        notEmpty: {
            errorMessage: 'Ide не выбрана',
        },
        custom: {
            options: (value:any)=>{
                if (Array.isArray(value)){
                    return value.every(el=>el.startsWith('v'))
                }
                return value.startsWith('v');
            },
            errorMessage: 'Не все элементы массива начинаются с v'
        }
    },
    'pets.*':{
        notEmpty: {
            errorMessage: 'Pets не выбраны',
        },
        custom: {
            options:(value:any)=>{
                console.log(value);
                if (!['dog', 'cat'].includes(value)) return false
                return true;
            },
            errorMessage: 'Не все элементы массива доступны',
        }
    },
    pets:{
        notEmpty: {
            errorMessage: 'Pets не выбраны',
        },
        custom: {
            options:(value:any)=>{
                console.log(value);
                if (!Array.isArray(value) && !['dog', 'cat'].includes(value)) return false
                return true;
            },
            errorMessage: 'Не все элементы массива доступны',
        }
    },
    story: {
        notEmpty: {
            errorMessage: 'Напишите историю',
        },
    }
}

const jsonValidationSchema = [
    body('email').isEmail().withMessage("Некорректный формат email"),
    body('password').isLength({min: 5, max: 32}).withMessage("Некорректная длина пароля"),
    body('confirmPassword').custom((value,{req})=>{
        if (value !== req.body.password) {
            throw new Error('Пароли не совпадают');
        }
        return true;
    }),
    param('id').notEmpty().withMessage('ID не указан'),
    query('pageNumber').isNumeric().withMessage('Номер страницы не является числом'),
    check('postsCount').isNumeric().withMessage('Количество постов должно быть числом'),
    header('headerKey').custom(value=>{console.log(value);return value.includes('english')}).withMessage('Ключ не содержит заданное слово'),
    cookie('Cookie_1').custom(value=>value === '123').withMessage('Поле не равно заданному значению')
]

const jsonValidationExpressSchema = {
    email: {
        isEmail: {
            errorMessage: 'Некорректный формат email'
        }
    },
    password: {
        isLength: {
            errorMessage: 'Некорректная длина пароля',
            options: {min: 5, max: 32}
        }
    },
    confirmPassword: {
        custom: {
            options: (value:any,{req}:any)=>{
                if (value !== req.body.password) {
                    throw new Error('Пароли не совпадают');
                }
                return true;
            }
        }
    },
    id:{
        notEmpty: {
            errorMessage: 'Некорректный формат email'
        }
    },
    pageNumber: {
        isNumeric: {
            errorMessage: 'Номер страницы не является числом'
        }
    },
    postsCount: {
        isNumeric: {
            errorMessage: 'Количество постов должно быть числом'
        }
    },
    headerKey: {
        custom: {
            options: (value:any)=>{console.log(value);return value.includes('english')},
            errorMessage: 'Ключ не содержит заданное слово'
        }
    },
    Cookie_1: {
        custom: {
            options: (value:any)=>value === '123',
            errorMessage: 'Поле не равно заданному значению'
        }
    }
}

app.get("/:id?", async (req,res,next)=>{
    res.render("index",{id:req.params.id});
})

app.post("/form",authMiddleware,formValidationSchema,async (req: RequestBody<FormBody>,res:any,next:any)=>{
    const body = req.body;
    const errors = validationResult(req);
    res.render("formResult", { errors:!errors.isEmpty()? errors:null, abc: 'abv' })
})

app.post("/form1",authMiddleware,checkSchema(formValidationExpressSchema),async (req: RequestBody<FormBody>,res:any,next:any)=>{
    const body = req.body;
    const errors = validationResult(req);
    res.render("formResult", { errors:!errors.isEmpty()? errors:null, abc: 'abv' })
})

app.post("/json/:id",authMiddleware,jsonValidationSchema,async (req:Request<{id:string},{},{email:string,password:string,confirmPassword:string},{postsCount:string,pageNumber:string}>,res:any,next:any)=>{
    const errors = validationResult(req);
    const body = req.body;
    const params = req.params;
    const query = req.query;
    const headers = req.headers;
    const cookie = getcookie(req);
    const cookies = req.cookies;

    function getcookie(req:any) {
        var cookie = req.headers.cookie;
        // user=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
        return cookie.split('; ');
    }

    res.send(errors.isEmpty()?"данные без ошибок😁":errors.array()[0].msg)
})

app.post("/jsonExpressSchema/:id",authMiddleware,checkSchema(jsonValidationExpressSchema),async (req:Request<{id:string},{},{email:string,password:string,confirmPassword:string},{postsCount:string,pageNumber:string}>,res:any,next:any)=>{
    const errors = validationResult(req);
    const body = req.body;
    const params = req.params;
    const query = req.query;
    const headers = req.headers;
    const cookie = getcookie(req);
    const cookies = req.cookies;

    function getcookie(req:any) {
        var cookie = req.headers.cookie;
        // user=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
        return cookie.split('; ');
    }

    res.send(errors.isEmpty()?"данные без ошибок😁":errors.array()[0].msg)
})

app.listen(process.env.PORT, async ()=>{
    console.log("Server start at "+process.env.PORT)
})