import emailjs from "@emailjs/browser";
import { useId, useState } from "react";
import usePageMeta from "../../seo/usePageMeta";

export default function Contact() {
  usePageMeta({
    title: "Contact | Willow Bend Family Clinic",
    description:
      "Contact Willow Bend Family Clinic in Meridian, ID. Send a message and view our location.",
    canonicalPath: "/contact",
  });

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [message, setMessage] = useState<string>("");

  const nameId = useId();
  const emailId = useId();
  const msgId = useId();

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const form = e.target as HTMLFormElement;

      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setStatus("sent");
      setMessage("Message sent. We will respond as soon as possible.");
      form.reset();
    } catch {
      setStatus("error");
      setMessage("Message failed to send. Please try again.");
    }
  };

  return (
    <section className="grid lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Contact</h1>
          <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
            For appointment requests, you can also use the Appointments page.
          </p>
        </header>

        <div className="card p-6 sm:p-7">
          <form
            onSubmit={send}
            className="space-y-5"
            aria-describedby="contact-status"
          >
            <div className="space-y-2">
              <label
                htmlFor={nameId}
                className="text-sm font-semibold"
                style={{ color: "var(--muted)" }}
              >
                Name
              </label>
              <input
                id={nameId}
                name="name"
                required
                autoComplete="name"
                className="input"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={emailId}
                className="text-sm font-semibold"
                style={{ color: "var(--muted)" }}
              >
                Email
              </label>
              <input
                id={emailId}
                name="email"
                required
                type="email"
                autoComplete="email"
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor={msgId}
                className="text-sm font-semibold"
                style={{ color: "var(--muted)" }}
              >
                Message
              </label>
              <textarea
                id={msgId}
                name="message"
                required
                className="input"
                placeholder="How can we help?"
                rows={7}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <button
                className="btn-hero"
                disabled={status === "sending"}
                aria-busy={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>

              <p
                id="contact-status"
                role="status"
                className="text-sm"
                style={{
                  color:
                    status === "error"
                      ? "rgba(239,68,68,0.95)"
                      : status === "sent"
                      ? "rgba(34,197,94,0.95)"
                      : "var(--muted)",
                }}
              >
                {message}
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Location</h2>
        <p className="text-[1.05rem]" style={{ color: "var(--muted)" }}>
          Willow Bend Family Clinic, 480 Willow Bend Dr, Suite 100, Meridian,
          ID 83642
        </p>

        <iframe
          title="Map to Willow Bend Family Clinic in Meridian, ID"
          className="w-full h-[26rem] rounded-2xl border"
          style={{ borderColor: "var(--border)" }}
          loading="lazy"
          referrerPolicy="no-referrer"
          src="https://www.google.com/maps?q=Meridian,ID&output=embed"
        />
      </div>
    </section>
  );
}
