"use client";

const imgFiles = "https://www.figma.com/api/mcp/asset/d8bc3e74-0b52-4b50-9f8e-a79ee2a317a0";
const imgHourglassHigh = "https://www.figma.com/api/mcp/asset/c92d9c7b-0141-4701-914b-ac5072d201a4";
const imgUsersThree = "https://www.figma.com/api/mcp/asset/913c50d1-7d7c-4053-9437-02058be2b7b2";
const imgSealCheck = "https://www.figma.com/api/mcp/asset/b206462d-a6e4-4d29-9f8b-ed6ece59126b";

interface StatCardProps {
  icon: string;
  number: string;
  title: string;
  description: string;
}

function StatCard({ icon, number, title, description }: StatCardProps) {
  return (
    <div
      className="relative bg-gradient-to-br from-teal-100 to-blue-50 rounded-[10px] p-8 text-center shadow-md hover:shadow-lg transition flex flex-col items-center gap-4"
      data-scroll-animation="up"
    >
      <img src={icon} alt={title} className="w-16 h-16" />
      <div className="text-4xl font-bold text-black">{number}</div>
      <h3 className="text-xl font-semibold text-black">{title}</h3>
      <p className="text-base text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
}

export default function LaporanPage() {
  return (
    <main className="w-full bg-white">
      {/* Transparency Commitment Section */}
      <div
        className="bg-gradient-to-r from-teal-50 to-blue-50 w-full px-6 md:px-10 py-12"
        data-scroll-animation="up"
      >
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-semibold text-black mb-2"
            data-scroll-animation="left"
          >
            Komitmen Transparansi
          </h2>
          <p
            className="text-lg md:text-xl text-gray-700 font-semibold mb-4"
            data-scroll-animation="left"
          >
            Tracking Laporan Secara Publik
          </p>
          <p
            className="text-base md:text-lg text-gray-700 leading-relaxed max-w-3xl"
            data-scroll-animation="right"
          >
            Kami menyediakan data terbuka yang dapat dipantau publik untuk memastikan setiap bantuan
            tersalurkan dengan tepat sasaran dan akuntabel.
          </p>
          <p className="text-sm md:text-base text-gray-600 mt-3" data-scroll-animation="right">
            SaGentong berkomitmen untuk menyediakan informasi yang terbuka, akurat, dan dapat
            dipantau publik demi memastikan bantuan tersalurkan dengan aman.
          </p>
        </div>
      </div>

      {/* Reports Section */}
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 w-full">
          {/* Title with Underline */}
          <div className="mb-12" data-scroll-animation="up">
            <h2 className="text-4xl md:text-5xl font-semibold text-teal-800 inline-block pb-2 border-b-4 border-teal-600">
              Laporan
            </h2>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard
              icon={imgFiles}
              number="342"
              title="Pelaporan Warga"
              description="Warga menyampaikan laporan banjir melalui RT/RW."
            />
            <StatCard
              icon={imgHourglassHigh}
              number="16"
              title="Input Dashboard"
              description="Perangkat desa mencatat laporan ke sistem."
            />
            <StatCard
              icon={imgSealCheck}
              number="124"
              title="Verifikasi & Notifikasi"
              description="Admin memvalidasi dan sistem mengirim notifikasi relawan"
            />
            <StatCard
              icon={imgUsersThree}
              number="87"
              title="Aksi Relawan"
              description="Relawan memilih bentuk bantuan sesuai kebutuhan"
            />
          </div>

          {/* Data Update Info */}
          <div
            className="bg-gradient-to-r from-teal-100 via-teal-50 to-teal-100 rounded-lg p-8 text-center mb-8"
            data-scroll-animation="up"
          >
            <h3 className="text-xl font-semibold text-black mb-3">Data terakhir diperbaharui :</h3>
            <p className="text-xl text-black font-medium">2 Maret 2026 17:45 WIB</p>
          </div>

          {/* Process Flow Description */}
          <div
            className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-8 md:p-12"
            data-scroll-animation="up"
          >
            <h3 className="text-2xl font-bold text-black mb-6">Alur Pelaporan</h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="text-2xl font-bold text-teal-600 min-w-8">1</div>
                <div>
                  <h4 className="font-semibold text-black">Pelaporan Warga</h4>
                  <p className="text-gray-700">
                    Warga menyampaikan laporan banjir melalui RT/RW (342 laporan)
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-2xl font-bold text-teal-600 min-w-8">2</div>
                <div>
                  <h4 className="font-semibold text-black">Input Dashboard</h4>
                  <p className="text-gray-700">
                    Perangkat desa mencatat laporan ke sistem (16 catatan)
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-2xl font-bold text-teal-600 min-w-8">3</div>
                <div>
                  <h4 className="font-semibold text-black">Verifikasi & Notifikasi</h4>
                  <p className="text-gray-700">
                    Admin memvalidasi dan sistem mengirim notifikasi relawan (124 verifikasi)
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="text-2xl font-bold text-teal-600 min-w-8">4</div>
                <div>
                  <h4 className="font-semibold text-black">Aksi Relawan</h4>
                  <p className="text-gray-700">
                    Relawan memilih bentuk bantuan sesuai kebutuhan (87 aksi)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
