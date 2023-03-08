import {Response} from 'express';
interface HandleErrorProps {
  e: unknown;
  res: Response;
}

const handleError = ({e, res}: HandleErrorProps) => {
  if (typeof e === 'string') {
    res.status(500).send(e.toString());
  } else if (e instanceof Error) {
    res.status(500).send(e.message);
  }
};

export default handleError;
