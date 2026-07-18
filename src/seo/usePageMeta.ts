import { useEffect } from "react";

type PageMeta = {
  title: string;
  description?: string;
  canonicalPath?: string;
  noIndex?: boolean;
};

function ensureMetaTag(name: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensurePropertyTag(property: string) {
  let tag = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`
  );
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureCanonical() {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="canonical"]`);
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  return link;
}

export default function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    if (meta.title) document.title = meta.title;

    if (meta.description !== undefined) {
      const d = ensureMetaTag("description");
      d.content = meta.description ?? "";
      const ogd = ensurePropertyTag("og:description");
      ogd.content = meta.description ?? "";
      const twd = ensureMetaTag("twitter:description");
      twd.content = meta.description ?? "";
    }

    // basic OG/twitter title mirrors
    if (meta.title) {
      const ogt = ensurePropertyTag("og:title");
      ogt.content = meta.title;
      const twt = ensureMetaTag("twitter:title");
      twt.content = meta.title;
    }

    // canonical
    if (meta.canonicalPath) {
      const canonical = ensureCanonical();
      const base = window.location.origin;
      canonical.href = `${base}${
        meta.canonicalPath.startsWith("/") ? "" : "/"
      }${meta.canonicalPath}`;
    }

    // robots noindex (useful for admin/login)
    const robots = ensureMetaTag("robots");
    robots.content = meta.noIndex ? "noindex,nofollow" : "index,follow";
  }, [meta.title, meta.description, meta.canonicalPath, meta.noIndex]);
}
