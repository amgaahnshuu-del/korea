export default function DataDeletionPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Data Deletion / Мэдээлэл устгах</h1>
      <p className="text-blue-900 mb-10">Ajil Korea — Facebook Data Deletion Instructions</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">How to delete your data</h2>
        <p className="text-blue-900 mb-4">
          If you want to delete all data associated with your Ajil Korea account (including
          data obtained via Facebook login), follow these steps:
        </p>
        <ol className="list-decimal pl-6 text-blue-900 space-y-2">
          <li>
            Send an email to{" "}
            <a href="mailto:batukakkr@gmail.com" className="text-[#22c55e] underline">
              batukakkr@gmail.com
            </a>{" "}
            with the subject: <strong>Data Deletion Request</strong>
          </li>
          <li>Include the email address associated with your account</li>
          <li>We will delete your account and all associated data within 30 days</li>
          <li>You will receive a confirmation email once deletion is complete</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">What data will be deleted</h2>
        <ul className="list-disc pl-6 text-blue-900 space-y-1">
          <li>Your account profile (name, email, avatar)</li>
          <li>All job applications you submitted</li>
          <li>Your uploaded CV/resume</li>
          <li>Your saved/favorite jobs</li>
          <li>All notifications</li>
        </ul>
      </section>

      <hr className="my-10" />

      <h2 className="text-2xl font-bold mb-4">Мэдээлэл устгах заавар (Монгол)</h2>
      <p className="text-blue-900 mb-4">
        Ajil Korea дахь бүртгэл болон мэдээллээ (Facebook нэвтрэлтээр олж авсан мэдээллийг оролцуулаад)
        устгуулахыг хүсвэл:
      </p>
      <ol className="list-decimal pl-6 text-blue-900 space-y-2">
        <li>
          <a href="mailto:batukakkr@gmail.com" className="text-[#22c55e] underline">
            batukakkr@gmail.com
          </a>{" "}
          руу <strong>«Data Deletion Request»</strong> гарчигтай и-мэйл илгээнэ үү
        </li>
        <li>Бүртгэлтэй и-мэйл хаягаа бичнэ үү</li>
        <li>30 хоногийн дотор бүх мэдээллийг устгана</li>
        <li>Устгасны дараа баталгаажуулах и-мэйл ирнэ</li>
      </ol>
    </div>
  );
}
