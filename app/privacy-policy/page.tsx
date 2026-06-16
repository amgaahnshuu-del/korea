export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy / Нууцлалын бодлого</h1>

      <p className="text-gray-500 mb-8">Last updated: June 2026</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
        <p className="text-gray-700 mb-2">
          When you use Ajil Korea, we may collect the following information:
        </p>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Name and email address (from Facebook or Google login)</li>
          <li>Profile picture (from Facebook or Google)</li>
          <li>Job application data you submit</li>
          <li>CV/resume files you upload</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>To create and manage your account</li>
          <li>To allow you to apply for jobs</li>
          <li>To send you notifications about your applications</li>
          <li>To improve our services</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Facebook Login</h2>
        <p className="text-gray-700">
          If you log in with Facebook, we receive your name, email address, and profile picture
          from Facebook. We do not store your Facebook password or access your friends list.
          We only request the minimum permissions needed: <strong>email</strong> and{" "}
          <strong>public_profile</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Sharing</h2>
        <p className="text-gray-700">
          We do not sell or share your personal data with third parties, except when required
          by law or to provide our services (e.g., database hosting).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Data Deletion</h2>
        <p className="text-gray-700">
          You can request deletion of your account and all associated data at any time.
          Visit our{" "}
          <a href="/data-deletion" className="text-blue-600 underline">
            Data Deletion page
          </a>{" "}
          for instructions.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
        <p className="text-gray-700">
          If you have any questions about this privacy policy, please contact us at:{" "}
          <a href="mailto:batukakkr@gmail.com" className="text-blue-600 underline">
            batukakkr@gmail.com
          </a>
        </p>
      </section>

      <hr className="my-10" />

      <h1 className="text-2xl font-bold mb-6">Нууцлалын бодлого (Монгол)</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Цуглуулдаг мэдээлэл</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-1">
          <li>Нэр болон и-мэйл хаяг (Facebook эсвэл Google нэвтрэлтээс)</li>
          <li>Профайл зураг</li>
          <li>Ажлын өргөдлийн мэдээлэл</li>
          <li>CV/resume файл</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Facebook нэвтрэлт</h2>
        <p className="text-gray-700">
          Facebook-ээр нэвтэрвэл бид таны нэр, и-мэйл, профайл зургийг авна.
          Нууц үг болон найзуудын жагсаалтад хандахгүй. Зөвхөн{" "}
          <strong>email</strong> болон <strong>public_profile</strong> зөвшөөрлийг ашиглана.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Мэдээлэл устгах</h2>
        <p className="text-gray-700">
          Та өөрийн бүртгэл болон бүх мэдээллийг устгуулахыг хүсвэл{" "}
          <a href="/data-deletion" className="text-blue-600 underline">
            Мэдээлэл устгах хуудас
          </a>
          -руу орно уу.
        </p>
      </section>
    </div>
  );
}
