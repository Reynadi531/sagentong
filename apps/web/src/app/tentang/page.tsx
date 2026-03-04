"use client";

import { ArrowRight } from "lucide-react";
import {
  PelaporanOlehWarga,
  InputDataOlehPerangkatDesa,
  VerifikasiNotifikasiSistem,
  AksiRelawan,
  UpdateStatus,
  PantauTitikBanjir,
  SistemInformasiTanggapBanjir,
  Tentang,
  UserSound,
  HandTap,
  SealCheck,
  UsersFour,
  ClockClockwise,
} from "@/components/sagentong-components";

export default function About() {
  const steps = [
    { icon: UserSound, label: PelaporanOlehWarga },
    { icon: HandTap, label: InputDataOlehPerangkatDesa },
    { icon: SealCheck, label: VerifikasiNotifikasiSistem },
    { icon: UsersFour, label: AksiRelawan },
    { icon: ClockClockwise, label: UpdateStatus },
  ];

  return (
    <section className="relative py-16 bg-white overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/95 to-gray-50" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-semibold text-dark-blue mb-3 font-['Poppins']">
            <Tentang />
          </h1>

          <div className="w-16 h-1 bg-teal-600 mx-auto my-4"></div>

          <h2 className="text-2xl md:text-3xl font-semibold text-teal-700 mb-4 font-['Poppins']">
            <SistemInformasiTanggapBanjir />
          </h2>

          <div className="max-w-2xl mx-auto text-gray-700 text-base leading-relaxed">
            <PantauTitikBanjir />
          </div>
        </div>

        {/* Process Steps */}
        <div className="mt-12">
          <h3 className="text-center text-xl font-semibold text-dark-blue mb-10">
            Proses Penanganan Banjir
          </h3>

          {/* Desktop */}
          <div className="hidden md:flex justify-center items-center gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const LabelComponent = step.label;

              return (
                <div key={index} className="flex items-center">
                  {/* Step */}
                  <div className="flex flex-col items-center text-center max-w-[140px]">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 shadow-md flex items-center justify-center mb-3">
                      <div className="w-12 h-12">
                        <IconComponent />
                      </div>
                    </div>

                    <div className="text-sm font-medium text-dark-blue">
                      <LabelComponent />
                    </div>
                  </div>

                  {/* Arrow */}
                  {index !== steps.length - 1 && (
                    <ArrowRight size={28} className="mx-4 text-teal-600" strokeWidth={2.5} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const LabelComponent = step.label;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm mb-3">
                    {index + 1}
                  </div>

                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-200 to-teal-400 shadow-md flex items-center justify-center mb-3">
                    <div className="w-10 h-10">
                      <IconComponent />
                    </div>
                  </div>

                  <div className="text-sm font-medium text-dark-blue text-center">
                    <LabelComponent />
                  </div>

                  {index !== steps.length - 1 && <div className="w-1 h-6 bg-teal-300 my-2" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg border border-teal-100">
            <h4 className="text-base font-semibold text-dark-blue mb-2">Real-Time Monitoring</h4>
            <p className="text-gray-600 text-sm">
              Pantau kondisi banjir secara real-time dengan data yang akurat dan selalu terupdate.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg border border-teal-100">
            <h4 className="text-base font-semibold text-dark-blue mb-2">Koordinasi Terpadu</h4>
            <p className="text-gray-600 text-sm">
              Koordinasi antar lembaga menjadi lebih mudah dengan sistem informasi terintegrasi.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg border border-teal-100">
            <h4 className="text-base font-semibold text-dark-blue mb-2">Respons Cepat</h4>
            <p className="text-gray-600 text-sm">
              Tim penanganan dapat merespons lebih cepat untuk meminimalkan dampak banjir.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
