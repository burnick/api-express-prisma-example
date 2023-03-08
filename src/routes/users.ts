import express, {Router, Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {body, param, validationResult} from 'express-validator';
import {UserProps} from '@/types';
import handleError from '@/utils/handleError';
import validatePhoneNumber from '@/utils/validatePhoneNumber';

const prisma = new PrismaClient();
const router: Router = express.Router();

const handleWrongPhoneNumber = async (message: string, value?: string) => {
  if (!value) {
    return Promise.reject('missing Phone value');
  }
  if (!validatePhoneNumber(value)) {
    return Promise.reject(message);
  }
};

const updateState = async (state: string) => {
  const existingState = await prisma.state.findFirst({
    where: {
      name: state,
    },
  });
  if (!existingState) {
    await prisma.state.create({
      data: {
        name: state,
      },
    });
  }
};

export const findUsersPerState = router.get(
  '/findUsersPerState',
  async (req: Request, res: Response) => {
    // await prisma.state.create({
    //   data: {
    //     name: 'South Carolina',
    //   },
    // });
    const states = await prisma.state.findMany();
    console.info('STATES', states);
    const users = await prisma.users.findMany();
    console.info(
      'USERS',
      users.map((user) => user.state)
    );

    const response: Record<string, unknown>[] =
      await prisma.$queryRaw`SELECT S.name as stateName, count(users.email) as usersCount  FROM state as S LEFT JOIN users   ON users.state = s.name GROUP BY S.id `;

    const converted = response.map((r: Record<string, unknown>) => ({
      count: r?.usersCount?.toString(),
      state: r?.stateName,
    }));

    return res.json(converted);
  }
);

export const CreateUser = router.post(
  '/users',
  body('email')
    .isEmail()
    .custom(async (value) => {
      if (!value) {
        return Promise.reject('missing Email');
      }
      const existingLogin = await prisma.users.findFirst({
        where: {
          email: value,
        },
      });
      if (existingLogin) {
        return Promise.reject('E-mail already in use');
      }
    }),
  body('address').isLength({min: 3}),
  body('city').isLength({min: 3}),
  body('state').isLength({min: 3}),
  body('zip').isLength({min: 3}),
  body('billing_address').isLength({min: 5}),
  body('billing_city').isLength({min: 5}),
  body('billing_state').isLength({min: 5}),
  body('billing_zip').isLength({min: 3}),
  body('work_phone')
    .isLength({min: 5})
    .custom((value) => {
      return handleWrongPhoneNumber('wrong work phone format', value);
    }),
  body('home_phone')
    .isLength({min: 7})
    .custom((value) => {
      return handleWrongPhoneNumber('wrong home phone format', value);
    }),
  body('mobile_phone')
    .isLength({min: 8})
    .custom((value) => {
      return handleWrongPhoneNumber('wrong mobile phone format', value);
    }),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    try {
      if (req.body.state) {
        updateState(req.body.state);
      }

      const user = await prisma.users.create({
        data: {
          ...req.body,
        },
      });
      if (!user) {
        res.status(500).send('Unable to create user');
      }
      res.json(user);
    } catch (e: unknown) {
      handleError({e, res});
    }
  }
);

export const FindUserByEmail = router.get(
  '/users/email/:email',
  param('email').isEmail(), // uid must be at least 5 chars long
  async (req: Request, res: Response) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    const {email} = req.params;
    try {
      const users = await prisma.users.findFirst({
        where: {
          email: email,
        },
      });
      if (!users) {
        res.status(404).send('Unknown user');
      } else {
        res.json(users);
      }
    } catch (e: unknown) {
      handleError({e, res});
    }
  }
);

export const DeleteByIds = router.delete(
  '/users',
  body('ids').isLength({min: 1}),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    const {ids} = req.body;
    const arrayIds = JSON.parse(ids);

    if (!Array.isArray(arrayIds)) {
      return res.status(400).json({errors: 'not an array of ids'});
    }

    try {
      const count = await prisma.users.deleteMany({
        where: {
          id: {
            in: arrayIds,
          },
        },
      });
      res.json(count);
    } catch (e: unknown) {
      handleError({e, res});
    }
  }
);

export const UpdateUserById = router.put(
  '/users',
  body('id').isLength({min: 1}),
  async (req: Request, res: Response) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    const {id} = req.body;
    const data: Record<string, unknown> = req.body;

    const userId = parseInt(id, 10);
    delete data.id;
    delete data.email;

    try {
      if (data?.state) {
        updateState(data?.state as string);
      }
      const users = await prisma.users.update({
        where: {
          id: userId,
        },
        data: {...data},
      });
      if (!users) {
        res.status(404).send('Unknown user');
      } else {
        res.json(users);
      }
    } catch (e: unknown) {
      handleError({e, res});
    }
  }
);

export const UpdateManyUsersById = router.put(
  '/users/update',
  body('users').isArray().isLength({min: 1}),
  async (req: Request, res: Response) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    const users: UserProps[] = req.body;

    try {
      if (users.length > 0) {
        users.map(async (user) => {
          const newUser: Record<string, unknown> = {...user};
          delete newUser.id;
          const result = await prisma.users.update({
            where: {
              id: user.id,
            },
            data: {...newUser},
          });
          if (newUser?.state) {
            updateState(newUser?.state as string);
          }
          if (!result || result.address !== newUser.address) {
            return res.status(400).json({errors: 'unable to update'});
          }
        });
      }
      res.status(200).send({success: 'updated'});
    } catch (e: unknown) {
      handleError({e, res});
    }
  }
);
