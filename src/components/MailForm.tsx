"use client";

import { person } from "@/resources";
import { Button, Heading, Input, Text, Column, Row, Textarea } from "@once-ui-system/core";
import { useState } from "react";

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  }) as T;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const MailForm: React.FC<React.ComponentProps<typeof Column>> = ({ ...flex }) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "Le nom est requis." : "";
      case "email":
        return value.trim() === "" ? "L'email est requis." : !validateEmail(value) ? "Veuillez entrer une adresse email valide." : "";
      case "subject":
        return value.trim() === "" ? "Le sujet est requis." : "";
      case "message":
        return value.trim() === "" ? "Le message est requis." : value.trim().length < 10 ? "Le message doit contenir au moins 10 caractères." : "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;

    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    const error = validateField(fieldName, value);
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage(null);

    // Validate all fields
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof FormData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error as never;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      setLoading(false);
      return;
    }

    try {
      // Send email via mailto (simple approach) or API
      // For now, using a simple mailto approach
      const mailtoLink = `mailto:${person.email}?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
        `Nom: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
      )}`;

      // You can also send via an API endpoint if you create one
      // For production, you'd want to use a backend service

      window.location.href = mailtoLink;

      // Reset form
      setFormData({ name: "", email: "", subject: "", message: "" });
      setErrors({});
      setTouched({});
      setSubmitMessage({ type: "success", text: "Merci ! Votre message a été envoyé." });

      setTimeout(() => {
        setSubmitMessage(null);
      }, 5000);
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: "Une erreur s'est produite. Veuillez réessayer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Column fillWidth maxWidth="m" gap="l" {...flex}>
      <Column gap="s">
        <Heading variant="display-strong-s">Contactez-moi</Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Vous avez une question ou une proposition ? N'hésitez pas à me contacter.
        </Text>
      </Column>

      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <Column fillWidth gap="m">
          <Column fillWidth gap="s">
            <Input
              id="name"
              name="name"
              label="Nom *"
              placeholder="Votre nom"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={touched.name ? (errors.name as string) : undefined}
              disabled={loading}
              required
            />
          </Column>

          <Column fillWidth gap="s">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email *"
              placeholder="votre.email@exemple.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={touched.email ? (errors.email as string) : undefined}
              disabled={loading}
              required
            />
          </Column>

          <Column fillWidth gap="s">
            <Input
              id="subject"
              name="subject"
              label="Sujet *"
              placeholder="Objet du message"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={touched.subject ? (errors.subject as string) : undefined}
              disabled={loading}
              required
            />
          </Column>

          <Column fillWidth gap="s">
            <Textarea
              id="message"
              name="message"
              label="Message *"
              placeholder="Votre message..."
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              errorMessage={touched.message ? (errors.message as string) : undefined}
              disabled={loading}
              required
              style={{ minHeight: "150px" }}
            />
          </Column>

          {submitMessage && (
            <Text
              variant="body-default-m"
              style={{
                padding: "12px",
                borderRadius: "8px",
                backgroundColor: submitMessage.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: submitMessage.type === "success" ? "#22c55e" : "#ef4444",
              }}
            >
              {submitMessage.text}
            </Text>
          )}

          <Row gap="m">
            <Button type="submit" size="l" disabled={loading} fillWidth>
              {loading ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </Row>
        </Column>
      </form>
    </Column>
  );
};
