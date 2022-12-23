import type { NextApiRequest, NextApiResponse } from "next";
import EmailValidator from "email-validator";

import {
  parseSchemaURL,
  SCHEMA_MANAGER_URL,
} from "../../../helpers/schema-helpers";
import { issuanceService } from "../../../services/issuance";
import { Octokit } from "@octokit/rest";
import { GithubRepo } from "../../../types/github";
import GithubService from "../../../services/github";

const SCHEMA_NAME = "DeveloperReputationV1-1";

type AnyObject = Record<string, any>;

interface CreateIssuanceOfferInput {
  verification: {
    target: {
      email: string;
    };
  };
  credentialSubject: AnyObject;
}

enum VerificationMethod {
  Email = "email",
}

interface CreateIssuanceInput {
  template: {
    walletUrl?: string;
    verification: {
      method: VerificationMethod;
    };
    schema: {
      jsonLdContextUrl: string;
      jsonSchemaUrl: string;
      type: string;
    };
    issuerDid: string;
  };
  projectId: string;
}
type IssueVCResponse = {
  error?: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<IssueVCResponse>
) => {
  if (req.method !== "POST") {
    res.status(405).send({ error: "Only POST requests allowed" });
    return;
  }

  const { email, accessToken } = req.body;
  if (!accessToken) {
    res.status(400).json({ error: "No access token" });
    return;
  }
  if (typeof email !== "string") {
    res.status(400).json({ error: "No email" });
    return;
  }

  if (!EmailValidator.validate(email)) {
    res.status(400).json({ error: "Invalid email input" });
  }

  const kit = new Octokit({ auth: accessToken });
  const user = await GithubService.getUserData(kit);
  const repos = await GithubService.getUserRepos(kit);
  const languages = await GithubService.getUserProgrammingLanguages(kit);

  try {
    const issuerDid = process.env.AFFINIDI_PROJECT_DID || "";
    const projectId = process.env.AFFINIDI_PROJECT_ID || "";

    const walletUrl = `https://holder-reference-app.stg.affinidi.com/holder/claim`;
    const issuanceJson: CreateIssuanceInput = {
      template: {
        walletUrl,
        verification: {
          method: VerificationMethod.Email,
        },
        schema: {
          type: "DeveloperReputationV1-2",
          jsonLdContextUrl:
            "https://schema.stg.affinidi.com/DeveloperReputationV1-2.jsonld",
          jsonSchemaUrl:
            "https://schema.stg.affinidi.com/DeveloperReputationV1-2.json",
        },
        issuerDid,
      },
      projectId,
    };

    const credentialSubject = {
      username: user.login,
      repos: repos.map((repo) => repo.name).join(", "),
      languages: languages.join(", "),
    };

    const offerInput: CreateIssuanceOfferInput = {
      verification: {
        target: { email },
      },
      credentialSubject,
    };

    const apiKeyHash = process.env.AFFINIDI_API_KEY_HASH || "";

    const issuance = await issuanceService.createIssuance(
      apiKeyHash,
      issuanceJson
    );

    await issuanceService.createOffer(apiKeyHash, issuance.id, offerInput);

    res.status(201).json({});
  } catch (error) {
    console.log("error:", error);
    res
      .status(400)
      .json({ error: "There was an error while trying to issue the VC" });
  }
};

export default handler;
