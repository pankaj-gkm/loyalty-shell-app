// @ts-expect-error no declaration file
import CryptoJS from "crypto-js";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { TextField } from "../TextField";
import { styles } from "./styles";
import RefreshIcon from "../../assets/refresh";
import { SelectField } from "../SelectField";
import { CheckboxField } from "../CheckboxField";
import { useCallback, useEffect, useState } from "react";
import { entries, fromEntries } from "../../utils/helpers";
import uuid4 from "uuid4";
import { useParams } from "react-router-dom";
import {
  BaseUrl,
  CLIENT_ID_MAP,
  isValidStoreIdentifier,
  STORE_MAP,
  StoreIdentifier,
} from "../../data";

const getEncryptedToken = (
  token: string,
  storeIdentifier: string,
  isStaging: boolean = false,
) => {
  const env = isStaging
    ? import.meta.env.VITE_LOYALTY_SALT_STAGING
    : import.meta.env.VITE_LOYALTY_SALT_PROD;

  const salt = JSON.parse(env)[storeIdentifier];

  const key = CryptoJS.enc.Utf8.parse(salt);
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(token?.toString()),
    key,
    {
      keySize: 128 / 8,
      iv: key,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );
  return encrypted?.toString();
};

const getLocalValue = <T extends keyof Form>(
  key: T,
  defaultValue: Form[T],
): Form[T] => {
  try {
    return (
      JSON.parse(localStorage.getItem("form") || "{}")?.[key] ?? defaultValue
    );
  } catch {
    return defaultValue;
  }
};

const QUICK_LINKS = [
  { link: "http://localhost:3000", name: "3000" },
  { link: "http://localhost:3001", name: "3001" },
  { link: "http://localhost:5173", name: "5173" },
  { link: "http://localhost:4173", name: "4173" },
  { link: "https://stage2.kstore.global/", name: "stage2" },
  { link: "https://stage3.kstore.global/", name: "stage3" },
];

const DEFAULT_VALUES = {
  isStaging: getLocalValue("isStaging", true),
  userId: "efd19263-aaae-433e-9fea-a302b5d73ce6",
  useCustomBaseUrl: getLocalValue("useCustomBaseUrl", true),
  customBaseUrl: getLocalValue("customBaseUrl", "http://localhost:5173"),
  productId: "",
  lang: "en",
};

type Form = {
  isStaging: boolean;
  userId: string;
  continueCtaTitle: string;
  continueCtaUrl: string;
  orderHistoryRedirectionUrl: string;
  useCustomBaseUrl: boolean;
  baseUrl: (typeof BaseUrl)["staging"]["KSTORE"];
  customBaseUrl: string;
  clientId: string;
  clientSecret: string;
  productId: string | undefined;
  lang: string | undefined;
};

const handleFormValues = (
  oldForm: Omit<Form, "baseUrl">,
  storeIdentifier: StoreIdentifier,
  isStaging?: boolean,
) => {
  const form: Form = {
    ...oldForm,
    baseUrl: STORE_MAP(isStaging)[storeIdentifier].baseUrls[0].value,
  };

  if (!form.isStaging) {
    form.clientId = "";
    form.clientSecret = "";
  } else {
    const { clientId, clientSecret } = CLIENT_ID_MAP[storeIdentifier];
    form.clientId = clientId;
    form.clientSecret = clientSecret;
  }

  return form;
};

const VALUES_TO_EXCLUDE = [
  "clientId",
  "clientSecret",
  "userId",
] as (keyof Form)[];

const Dashboard = ({
  storeIdentifier,
}: {
  storeIdentifier: StoreIdentifier;
}) => {
  const isStagingLocal = getLocalValue("isStaging", true);
  const form = useForm<Form>({
    defaultValues: handleFormValues(
      {
        ...DEFAULT_VALUES,
        ...CLIENT_ID_MAP[storeIdentifier],
        productId:
          STORE_MAP(isStagingLocal)["ht-kstore-india"]?.products[0]?.value,
      },
      storeIdentifier,
      isStagingLocal,
    ),
  });

  const [iframeOptions, setIframeOptions] = useState<{
    isOpen: boolean;
    token?: string;
  }>({ isOpen: false });

  const { control, getValues } = form;

  const formValues = useWatch({ control });
  const isDevMode = JSON.parse(localStorage.getItem("isDevMode") || "false");

  useEffect(() => {
    const values = { ...formValues };

    VALUES_TO_EXCLUDE.forEach((key) => {
      delete values[key];
    });

    if (values) {
      localStorage.setItem("form", JSON.stringify(values));
    }
  }, [formValues]);

  const getSessionToken = useCallback(async (user?: string) => {
    const values = form.getValues();

    const tokens = {
      "x-client-id": values.clientId,
      "x-client-secret": values.clientSecret,
    };

    const loyaltyProtocolBaseUrl = values.isStaging
      ? "https://stage-platform-protocols.kgen.io"
      : "https://prod-platform-protocols.kgen.io";

    const data = await fetch(`${loyaltyProtocolBaseUrl}/s2s/session`, {
      method: "POST",
      headers: { ...tokens, "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user || values.userId }),
    });

    const { token } = (await data.json()) || {};
    setIframeOptions({
      isOpen: false,
      token: getEncryptedToken(token, storeIdentifier, formValues.isStaging),
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    getSessionToken();
  }, [formValues.userId, getSessionToken]);

  const getParams = () => {
    const values = getValues();

    const p = (v?: string) => (v ? v : undefined);

    const params = entries({
      storeIdentifier: p(storeIdentifier),
      continueCtaTitle: p(values.continueCtaTitle),
      continueCtaRedirectionUrl: p(values.continueCtaUrl),
      orderHistoryRedirectionUrl: p(values.orderHistoryRedirectionUrl),
      lang: p(values.lang),
      productId: p(values.productId),
      sessionToken: p(iframeOptions.token),
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
              value,
            )}`,
        )
        .join("&");
      return `<span style="color: #FFA07A; font-weight: bold;">${path}</span>?${highlightedParams}`;
    } catch {
      return url;
    }
  }

  function getRedirectUrl(): string {
    const params = getParams();
    const { baseUrl, customBaseUrl, useCustomBaseUrl } = getValues();
    const path = useCustomBaseUrl ? customBaseUrl : baseUrl;

    return `${path}?${params.toString()}`;
  }

  async function handleSubmitClick() {
    setIframeOptions((prev) => ({ ...prev, isOpen: true }));
  }

  if (iframeOptions.isOpen) {
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
            onClick={() => form.setValue("userId", uuid4())}
          >
            <RefreshIcon />
          </button>
          <button
            style={styles.createSessionButton}
            onClick={() => getSessionToken()}
          >
            Create Session
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
          <TextField control={control} name="clientId" label="Client ID" />
          <TextField
            control={control}
            name="clientSecret"
            label="Client Secret"
          />
        </div>

        <div style={styles.row}>
          {STORE_MAP(formValues.isStaging)[storeIdentifier].products.length ? (
            <SelectField
              label="Product"
              options={
                STORE_MAP(formValues.isStaging)[storeIdentifier].products
              }
              onChange={({ target: { value } }) => {
                form.setValue("productId", value);
              }}
            />
          ) : null}
          <TextField control={control} name="lang" label="Language" />
        </div>

        <div style={{ ...styles.row, marginTop: 10 }}>
          <CheckboxField
            control={control}
            name="isStaging"
            label="Stage Env"
            onChange={({ target: { checked } }) => {
              form.reset(
                handleFormValues(
                  { ...form.getValues(), isStaging: checked },
                  storeIdentifier,
                  checked,
                ),
              );
            }}
          />

          <SelectField
            options={STORE_MAP(formValues.isStaging)[storeIdentifier].baseUrls}
            disabled={getValues().useCustomBaseUrl}
            onChange={({ target: { value } }) =>
              form.setValue(
                "baseUrl",
                value as (typeof BaseUrl)["staging"]["KSTORE"],
              )
            }
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

        <div style={styles.quickLinks}>
          <button onClick={handleSubmitClick} disabled={!iframeOptions.token}>
            Redirect
          </button>
          {QUICK_LINKS.map(({ link, name }) => (
            <button
              onClick={() => {
                form.setValue("useCustomBaseUrl", true);
                form.setValue("customBaseUrl", link);
                handleSubmitClick();
              }}
              hidden={!isDevMode}
              disabled={!iframeOptions.token}
            >
              {name}
            </button>
          ))}
        </div>

        <div
          dangerouslySetInnerHTML={{
            __html: highlightSearchParams(iframeOptions.token || ""),
          }}
          style={styles.redirectUriField}
          className="redirectField"
        />
      </FormProvider>

      {isDevMode && (
        <div style={styles.quickLinks}>
          {Object.values(StoreIdentifier).map((id) => (
            <a style={styles.redirectLinks} href={`/loyalty-shell-app/${id}`}>
              {id}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardWrapper = () => {
  const { storeIdentifier } = useParams();

  if (!isValidStoreIdentifier(storeIdentifier)) {
    return <div>Not valid Store Identifier</div>;
  }

  return <Dashboard storeIdentifier={storeIdentifier} />;
};

export default DashboardWrapper;
