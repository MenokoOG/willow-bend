# The clinic site I couldn't show anyone

I spent months building a website for a real medical clinic. Then I realized I couldn't show it to anybody.

The client's name was in the page titles. Their phone number sat in the footer. Their admin emails were hardcoded into the auth allowlist, and their initials were hiding in localStorage key names.

So I rebuilt it as a fiction.

Willow Bend Family Clinic, Meridian, Idaho. Doesn't exist. The address is fake, the phone number is fake, the 3 providers on the care team page are fake. Every string, meta tag, sitemap entry, and storage key from the original client is gone. Sanitizing a codebase teaches you how much of a client leaks into one. I found traces in 26 files.

Then I pushed it past what the contract ever asked for.

A designer handed me 6 HTML mockups: warm sage palette, full light and dark themes, new typography. I reimplemented all of it in React with a CSS token system, and aliased the old token names so the pages I didn't rebuild picked up the new look for free.

The part I care about most is Willow, the clinic's AI assistant. She runs on OpenAI through a serverless function, so the API key never touches the browser.

And she has a spine. If the key is missing, the call times out, or the API has a bad day, she drops to a deterministic keyword engine and keeps answering. A demo that dies on stage is worthless. This one can't.

If a message looks like a medical emergency, the app answers "call 911" from local code before any network request happens. The model never sees it.

One more rule, and it's the one I'd defend hardest: the AI cannot approve an appointment. A human at the clinic clicks approve, every time. That rule is written into the repo's agent instructions, so even the coding agents that work on this project with me have to obey it.

The whole thing runs on Firebase and Netlify with no server to babysit. The repo reads like a team maintains it: a changelog, architecture decision records, agent rules, and a use-case doc that doubles as the project's story.

This is the work I'm doing at classHuman AI, the company I'm building with my daughter Nicale. Our operating principle is LAHA, Love All Humans Always. Keeping a human between an algorithm and a patient's appointment is what that looks like in code.

---

*Draft for LinkedIn. Post it yourself; nothing here is published anywhere.*
