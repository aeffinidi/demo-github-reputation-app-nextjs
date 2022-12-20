import type { NextApiRequest, NextApiResponse } from "next";

import { GithubUser } from "../../types/github";

type Data = {
  user?: GithubUser;
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  let { access_token: token } = req.query;
  if (!token || typeof token !== "string") {
    res.status(404).json({ error: "No token" });
    return;
  }

  if (token.indexOf("Bearer") === -1) {
    token = `Bearer ${token}`;
  }

  const resp = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: token,
    },
  });
  const user: GithubUser = await resp.json();
  res.json({ user });
};

export default handler;
