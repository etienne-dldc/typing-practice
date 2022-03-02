import { Fragment, memo } from "react";
import { ApiError } from "nextype/shared";
import Link from "next/link";
import { AppError } from "src/logic/AppError";
import { expectNever } from "src/logic/Utils";

type Props = {
  error?: unknown;
  apiError?: ApiError<AppError>;
};

export const ErrorBox = memo(function ErrorBox({ error, apiError }: Props) {
  if (apiError) {
    const details = apiError.details;
    if (details.type === "AppError") {
      if (details.error.type === "AuthenticationError") {
        if (details.error.reason === "OtpInvalid") {
          return <ErrorBoxInternal title="Code invalide" details={`Ce code n'est pas valide`} />;
        }
        if (details.error.reason === "OtpExpired") {
          return <ErrorBoxInternal title="Code invalide" details={`Ce code n'est plus valide`} />;
        }
        if (details.error.reason === "UserNotFound") {
          return <ErrorBoxInternal title="Utilisateur invalide" details="Cet utilisateur n'existe pas." />;
        }
        if (details.error.reason === "MustBeAnonymous") {
          return <ErrorBoxInternal title="Vous devez être déconnecté" />;
        }
        return expectNever(details.error.reason);
      }
      if (details.error.type === "Unauthorized") {
        return <ErrorBoxInternal title="Non authorisé" details="Tu n'es pas autorisé à accéder à ce contenu." />;
      }
      if (details.error.type === "MissingProvider") {
        return (
          <ErrorBoxInternal title="Erreur interne" details={`Le provider "${details.error.provider}" est manquant.`} />
        );
      }
      return expectNever(details.error);
    }
    if (details.type === "RpcError") {
      if (details.details.type === "InvalidMethod") {
        return <ErrorBoxInternal title="RPC Méthode invalide" />;
      }
      if (details.details.type === "InvalidParams") {
        return <ErrorBoxInternal title="RPC Paramètres invalides" details={`Route: "${details.details.routeKey}"`} />;
      }
      if (details.details.type === "InvalidRouteKind") {
        return (
          <ErrorBoxInternal
            title="RPC Route invalide"
            details={`Route: "${details.details.routeKey}", reveived ${details.details.received}`}
          />
        );
      }
      if (details.details.type === "MissingParams") {
        return <ErrorBoxInternal title="RPC Paramètres manquants" details={`Route: "${details.details.routeKey}"`} />;
      }
      if (details.details.type === "RouteDidNotRespond") {
        return (
          <ErrorBoxInternal title="La route RPC n'as pas répondu" details={`Route: "${details.details.routeKey}"`} />
        );
      }
      if (details.details.type === "RouteError") {
        return (
          <ErrorBoxInternal
            title="La route RPC a renvoyé une erreur"
            details={`Route: "${details.details.routeKey}"`}
          />
        );
      }
      if (details.details.type === "RouteNotFound") {
        return <ErrorBoxInternal title="RPC route non trouvée" details={`Route: "${details.details.routeKey}"`} />;
      }
      return expectNever(details.details);
    }
    if (details.type === "NetworkError") {
      return <ErrorBoxInternal title="Erreur Réseau" details={errorMessage(details.error)} />;
    }
    if (details.type === "FatalClientError") {
      return <ErrorBoxInternal title="Erreur Interne (navigateur)" details={errorMessage(details.error)} />;
    }
    if (details.type === "InternalServerError") {
      return <ErrorBoxInternal title="Erreur Interne (serveur)" />;
    }
    if (details.type === "ApiDidNotRespond") {
      return <ErrorBoxInternal title="L'API n'a pas répondu" />;
    }
    if (details.type === "InvalidMiddlewareResult") {
      return <ErrorBoxInternal title="Erreur Interne" details={`Résultat du middleware est invalide.`} />;
    }
    if (details.type === "MethodNotFound") {
      return <ErrorBoxInternal title="Méthode non trouvé" />;
    }
    return expectNever(details);
  }
  if (error === null || error === undefined) {
    return <ErrorBoxInternal title="Erreur inconnu" />;
  }
  if (typeof error === "string") {
    if (error.length > 40) {
      return <ErrorBoxInternal title="Erreur" details={error} />;
    }
    return <ErrorBoxInternal title={error} />;
  }
  if (error instanceof Error) {
    return <ErrorBoxInternal title={error.message} />;
  }
  return <ErrorBoxInternal title="Error" />;
});

type ErrorBoxInternalProps = {
  title: string;
  details?: React.ReactNode;
};

function ErrorBoxInternal({ title, details }: ErrorBoxInternalProps): JSX.Element {
  return (
    <div className="text-white bg-red-500 p-2 rounded">
      <h2 className="text-lg">{title}</h2>
      {details && <p className="text-md">{details}</p>}
    </div>
  );
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}
