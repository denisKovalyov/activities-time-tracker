export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen p-4">
      <h2 className="prose-xl text-center">Privacy Policy</h2>

      <h3 className="prose-lg mt-5 mb-2">
        Introduction
      </h3>
      <p>
        {`This Privacy Policy outlines how ${process.env.APP_NAME} (“we,” “our,” or “us”) collects, uses, and protects your personal information when you use our app to track your activities. By using our app, you agree to the collection and use of information in accordance with this Privacy Policy.`}
      </p>

      <h3 className="prose-lg mt-5 mb-2">
        Information We Collect
      </h3>
      <p className="mb-2">
        To provide our services, we may collect the following information:
      </p>
      <ul className="list-disc list-inside">
        <li className="mb-2">
          <span className="font-semibold">Personal Information:</span> We may collect personal information that
          identifies you, including your email address, a hashed password, and (optionally) your nickname or name.
        </li>
        <li>
          <span className="font-semibold">Activity Data:</span> We also store the activities you create within the app,
          such as the types of activities (e.g., sports, reading, studying) and the time you spend on each.
        </li>
      </ul>

      <h3 className="prose-lg mt-5 mb-2">
        Use of Your Information
      </h3>
      <p className="mb-2">
        We use the information collected to:
      </p>
      <ul className="list-disc list-inside">
        <li className="mb-2">Provide, maintain, and improve our app.</li>
        <li className="mb-2">Ensure secure login and account management.</li>
        <li className="mb-2">Personalize your experience with the app.</li>
      </ul>

      <h3 className="prose-lg mt-5 mb-2">
        Data Security
      </h3>
      <p className="mb-2">
        We implement commercially reasonable measures to protect your personal data. However, please note that no method
        of electronic storage or transmission over the internet is 100% secure, and we cannot guarantee absolute
        security.
      </p>


      <h3 className="prose-lg mt-5 mb-2">
        Data Retention and Deletion
      </h3>
      <ul className="list-disc list-inside">
        <li className="mb-2">
          <span className="font-semibold">Retention:</span> We retain your personal data for as long as you maintain an
          account with us or as necessary to fulfill the purposes outlined in this policy.
        </li>
        <li className="mb-2">
          <span className="font-semibold">Deletion:</span>
          <span>
            {` You may request to delete your account and personal
            information at any time by contacting us at `}
          </span>
          <a href={`mailto:${process.env.APP_SUPPORT_EMAIL}?subject=${process.env.APP_SHORT_NAME}: Support Request`}>
            {process.env.APP_SUPPORT_EMAIL}
          </a>
          <span>
            {` Upon receiving a deletion request, we will make reasonable efforts to securely delete your data from our records.`}
          </span>
        </li>
        <li className="mb-2">
          <span className="font-semibold">Loss or Data Deletion:</span> During app development, there may be instances
          where your data is accidentally deleted or lost.
          We strive to minimize these occurrences, but please be aware that such risks may exist.
        </li>
      </ul>

      <h3 className="prose-lg mt-5 mb-2">
        Changes to This Privacy Policy
      </h3>
      <p className="mb-2">
        We may update our Privacy Policy from time to time.
        Any changes will be posted on this page, and you are advised to review this policy periodically for any updates.
      </p>

      <h3 className="prose-lg mt-5 mb-2">
        Contact Us
      </h3>
      <p className="mb-2">
        <span>{`If you have any questions about this Privacy Policy, please contact us at `}</span>
        <a href={`mailto:${process.env.APP_SUPPORT_EMAIL}?subject=${process.env.APP_SHORT_NAME}: Support Request`}>
          {process.env.APP_SUPPORT_EMAIL}
        </a>
      </p>

      <p className="mt-5 italic text-right">Last updated: 30-10-2024</p>
    </main>
  );
}
