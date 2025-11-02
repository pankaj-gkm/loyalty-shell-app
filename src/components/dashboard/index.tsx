// @ts-expect-error no declaration file
import CryptoJS from "crypto-js";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { TextField } from "../TextField";
import { styles } from "./styles";
import RefreshIcon from "../../assets/refresh";
import { SelectField } from "../SelectField";
import { CheckboxField } from "../CheckboxField";
import { useEffect, useState } from "react";
import { entries, fromEntries } from "../../utils/helpers";
import uuid4 from "uuid4";

enum StoreIdentifier {
  HT = "ht-kstore-india",
  TIMES = "times-now-kstore-india",
}

enum BaseUrl {
  KSTORE = "https://stage.kstore.global",
  LOYALTY = "https://loyalty.kgen.global",
}

const { HT, TIMES } = StoreIdentifier;
const { KSTORE, LOYALTY } = BaseUrl;

const CLIENT_ID_MAP = {
  [StoreIdentifier.HT]: {
    id: "209cbe38-abf2-4673-8c86-f1be4942eacc",
    secret: "f3mm1OKppwdfd7Wtu2F8YMCwlOWOXH680kPmEzP02d",
  },
  [StoreIdentifier.TIMES]: {
    id: "102493df-fead-4a01-ae93-a5a7fbbadc8d",
    secret: "0aRxAQe7wKaMxAvKcBDQ3DSEVu7uYxHFmP4WKJMrVkr",
  },
};

const getEncryptedToken = (token: string) => {
  const key = CryptoJS.enc.Utf8.parse("aKpQzRtd"); // salt should be taken from env
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(token?.toString()),
    key,
    {
      keySize: 128 / 8,
      iv: key,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );
  return encrypted?.toString();
};

const getClientIdAndSecret = (
  isStaging: boolean,
  storeIdentifier: StoreIdentifier
) => {
  if (!isStaging) {
    return { id: undefined, secret: undefined };
  }

  return CLIENT_ID_MAP[storeIdentifier];
};

const DEFAULT_VALUES = {
  isStaging: true,
  userId: "efd19263-aaae-433e-9fea-a302b5d73ce6",
  continueCtaTitle: "Continue Reading",
  continueCtaUrl: "https://www.hindustantimes.com/sports",
  orderHistoryRedirectionUrl: "https://www.hindustantimes.com/order-history",
  storeIdentifier: StoreIdentifier.HT,
  useCustomBaseUrl: true,
  baseUrl: KSTORE,
  customBaseUrl: "http://localhost:3000",
  clientId: CLIENT_ID_MAP[StoreIdentifier.HT].id,
  clientSecret: CLIENT_ID_MAP[StoreIdentifier.HT].secret,
};

type Form = typeof DEFAULT_VALUES;
const VALUES_TO_EXCLUDE = [
  "clientId",
  "clientSecret",
  "userId",
] as (keyof Form)[];

const Dashboard = () => {
  const localForm = localStorage.getItem("form");

  const defaultValues =
    (localForm && (JSON.parse(localForm) as Form)) || DEFAULT_VALUES;
  const { id, secret } = getClientIdAndSecret(
    defaultValues.isStaging,
    defaultValues.storeIdentifier
  );

  const form = useForm<Form>({
    defaultValues: {
      ...DEFAULT_VALUES,
      ...defaultValues,
      clientId: id,
      clientSecret: secret,
    },
  });

  const [sessionToken, setSessionToken] = useState();
  const [isIframeOpen, setIsIframeOpen] = useState(false);

  const { control, getValues } = form;

  const formValues = useWatch({ control });

  useEffect(() => {
    const values = { ...formValues };

    VALUES_TO_EXCLUDE.forEach((key) => {
      delete values[key];
    });

    if (values) {
      localStorage.setItem("form", JSON.stringify(values));
    }
  }, [formValues]);

  const getParams = () => {
    const values = getValues();

    const p = (v?: string) => (v ? v : undefined);

    const params = entries({
      storeIdentifier: p(values.storeIdentifier),
      continueCtaTitle: p(values.continueCtaTitle),
      continueCtaRedirectionUrl: p(values.continueCtaUrl),
      orderHistoryRedirectionUrl: p(values.orderHistoryRedirectionUrl),
      sessionToken: p(sessionToken),
    })
      .map(([key, value]) => (value ? ([key, value] as const) : undefined))
      .filter((v) => !!v);

    return new URLSearchParams(fromEntries(params));
  };

  function highlightSearchParams(url: string): string {
    const values = getValues();

    const { baseUrl, customBaseUrl, useCustomBaseUrl } = values;
    const path = useCustomBaseUrl ? customBaseUrl : baseUrl;
    const params = getParams();

    try {
      const highlightedParams = Array.from(params.entries())
        .map(
          ([key, value]) =>
            `<span style="color: #F0E68C; font-weight: bold;">${key}</span>=${encodeURIComponent(
              value
            )}`
        )
        .join("&");
      return `<span style="color: #FFA07A; font-weight: bold;">${path}</span>?${highlightedParams}`;
    } catch {
      return url;
    }
  }

  const getSessionToken = (user?: string) => {
    const values = getValues();

    const tokens = {
      "x-client-id": values.clientId,
      "x-client-secret": values.clientSecret,
    };

    const loyaltyProtocolBaseUrl = values.isStaging
      ? "https://stage-platform-protocols.kgen.io"
      : "https://prod-platform-protocols.kgen.io";

    fetch(`${loyaltyProtocolBaseUrl}/s2s/session`, {
      method: "POST",
      headers: { ...tokens, "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user || values.userId }),
    })
      .then((response) => response.json())
      .then((data) => {
        return setSessionToken(getEncryptedToken(data.token));
      })
      .catch((error) => console.error("Error:", error));
  };

  const setClientIdAndSecret = (
    storeIdentifier: StoreIdentifier,
    passedIsStaging?: boolean
  ) => {
    const isStaging = passedIsStaging ?? getValues().isStaging;
    const { id, secret } = getClientIdAndSecret(isStaging, storeIdentifier);

    form.setValue("clientId", id || "");
    form.setValue("clientSecret", secret || "");
  };

  function getRedirectUrl(): string {
    const params = getParams();
    const { baseUrl, customBaseUrl, useCustomBaseUrl } = getValues();
    const path = useCustomBaseUrl ? customBaseUrl : baseUrl;

    return `${path}?${params.toString()}`;
  }

  if (isIframeOpen) {
    return (
      <iframe
        src={getRedirectUrl()}
        allow="clipboard-read; clipboard-write"
        style={{ width: "100dvw", height: "100dvh", border: "none" }}
      />
    );
  }

  return (
    <div style={styles.container}>
      <FormProvider {...form}>
        <div style={styles.row}>
          <TextField
            control={control}
            name="userId"
            style={{ minHeight: 36, fontSize: 14 }}
            containerStyle={{ flex: 1 }}
          />
          <button
            style={styles.refreshButton}
            onClick={() => {
              const user = uuid4();
              form.setValue("userId", user);
              getSessionToken(user);
            }}
          >
            <RefreshIcon />
          </button>
          <button
            style={styles.createSessionButton}
            onClick={() => getSessionToken()}
          >
            <span>Create Session</span>
          </button>
        </div>

        <div style={styles.row}>
          <TextField
            control={control}
            name="continueCtaTitle"
            label="Continue Cta Title"
          />
          <TextField
            control={control}
            name="continueCtaUrl"
            label="Continue Cta Url"
          />
          <TextField
            control={control}
            name="orderHistoryRedirectionUrl"
            label="Order History URL"
          />
        </div>

        <div style={styles.row}>
          <SelectField
            control={control}
            label="Store"
            name="storeIdentifier"
            options={[
              { label: `HT - ${HT}`, value: HT },
              { label: `Times - ${TIMES}`, value: TIMES },
            ]}
            onChange={({ target: { value } }) => {
              setClientIdAndSecret(value as StoreIdentifier);
              setSessionToken(undefined);
            }}
          />
          <TextField control={control} name="clientId" label="Client ID" />
          <TextField
            control={control}
            name="clientSecret"
            label="Client Secret"
          />
        </div>

        <div style={{ ...styles.row, marginTop: 10 }}>
          <CheckboxField
            control={control}
            name="isStaging"
            label="Stage Env"
            onChange={({ target: { checked } }) => {
              if (checked) {
                setClientIdAndSecret(getValues().storeIdentifier, checked);
              } else {
                form.setValue("clientId", "");
                form.setValue("clientSecret", "");
              }
            }}
          />

          <SelectField
            control={control}
            name="baseUrl"
            options={[
              { label: `K-Store - ${KSTORE}`, value: KSTORE },
              { label: `Loyalty - ${LOYALTY}`, value: LOYALTY },
            ]}
            disabled={getValues().useCustomBaseUrl}
          />
          <CheckboxField
            control={control}
            name="useCustomBaseUrl"
            label="Use Custom Base URL"
          />
          <TextField
            control={control}
            name="customBaseUrl"
            disabled={!getValues().useCustomBaseUrl}
          />
        </div>

        <div>
          <button
            disabled={!sessionToken}
            onClick={() => setIsIframeOpen(true)}
          >
            Redirect
          </button>
        </div>

        <div
          dangerouslySetInnerHTML={{
            __html: highlightSearchParams(sessionToken || ""),
          }}
          style={styles.redirectUriField}
          className="redirectField"
        />
      </FormProvider>
    </div>
  );
};

export default Dashboard;
