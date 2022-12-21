import type { NextApiRequest, NextApiResponse } from "next";
import EmailValidator from "email-validator";

import {
  parseSchemaURL,
  SCHEMA_MANAGER_URL,
} from "../../../helpers/schema-helpers";
import { issuanceService } from "../../../services/issuance";

const SCHEMA_NAME = "DeveloperReputationV1-0";

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

  try {
    const issuerDid = process.env.AFFINIDI_PROJECT_DID || "";
    const projectId = process.env.AFFINIDI_PROJECT_ID || "";
    const { schemaType, jsonSchema, jsonLdContext } = parseSchemaURL(
      `${SCHEMA_MANAGER_URL}/schemas/${SCHEMA_NAME}`
    );

    const issuanceJson: CreateIssuanceInput = {
      template: {
        verification: {
          method: VerificationMethod.Email,
        },
        schema: {
          type: schemaType,
          jsonLdContextUrl: jsonLdContext.toString(),
          jsonSchemaUrl: jsonSchema.toString(),
        },
        issuerDid,
      },
      projectId,
    };

    const credentialSubject = {
      username: "Atsuhiro",
      repos: ["repo-1", "repo-000", "bad-repo-1", "shitty-repo-3"],
      languages: ["typescript", "javascript", "pipi-script"],
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

    const offerDto = await issuanceService.createOffer(
      apiKeyHash,
      issuance.id,
      offerInput
    );

    console.log("offerDto:", offerDto);

    res.status(201).json({});
  } catch (error) {
    res
      .status(400)
      .json({ error: "There was an error while trying to issue the VC" });
  }
};

export default handler;
