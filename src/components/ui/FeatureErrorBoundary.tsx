"use client";

import React, { ErrorInfo, ReactNode } from "react";
import { Button } from "./button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  featureName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FeatureErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const feature = this.props.featureName || "Desconhecida";
    // Here we can log the error to an error reporting service
    console.error(`[Feature Error: ${feature}]`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-red-200 bg-red-50/50 rounded-lg text-center gap-4 m-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-red-800">
              Falha na Funcionalidade{this.props.featureName ? ` (${this.props.featureName})` : ""}
            </h3>
            <p className="text-sm text-red-600 max-w-[300px]">
              Ocorreu um erro inesperado ao carregar esta seção. O resto do aplicativo continua funcionando normalmente.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="mt-2 border-red-200 text-red-700 hover:bg-red-100 hover:text-red-800"
          >
            Tentar Novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
