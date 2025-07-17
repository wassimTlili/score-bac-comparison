'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, MapPin, Users, TrendingUp, Star, GraduationCap, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OrientationDetailPage({ params }) {
  const router = useRouter();
  const [orientation, setOrientation] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in a real app, this would come from an API
  const orientations = {
    1: {
      id: 1,
      name: 'الهندسة المعلوماتية',
      category: 'engineering',
      description: 'تخصص يركز على تطوير البرمجيات وأنظمة المعلومات والذكاء الاصطناعي',
      fullDescription: 'تخصص الهندسة المعلوماتية يهدف إلى تكوين مهندسين قادرين على تحليل وتصميم وتطوير أنظمة المعلومات المعقدة. يتضمن البرنامج دراسة البرمجة، قواعد البيانات، الشبكات، الذكاء الاصطناعي، والأمن السيبراني.',
      duration: '3 سنوات',
      level: 'ليسانس',
      popularity: 95,
      requirements: 'رياضيات، فيزياء، إعلامية',
      universities: [
        { name: 'المعهد العالي للمعلوماتية', location: 'تونس', seats: 200 },
        { name: 'كلية العلوم - تونس', location: 'تونس', seats: 150 },
        { name: 'المعهد العالي للمعلوماتية والرياضيات', location: 'المنستير', seats: 100 }
      ],
      prospects: [
        { title: 'مطور برمجيات', salary: '1200-2500 د.ت', demand: 'عالي' },
        { title: 'مهندس نظم', salary: '1500-3000 د.ت', demand: 'عالي' },
        { title: 'محلل أنظمة', salary: '1300-2800 د.ت', demand: 'متوسط' },
        { title: 'مهندس أمن سيبراني', salary: '1800-3500 د.ت', demand: 'عالي جداً' }
      ],
      averageScore: 15.5,
      curriculum: [
        { semester: 'السنة الأولى', subjects: ['رياضيات', 'فيزياء', 'مقدمة في البرمجة', 'منطق رياضي'] },
        { semester: 'السنة الثانية', subjects: ['هياكل البيانات', 'قواعد البيانات', 'الشبكات', 'تحليل الأنظمة'] },
        { semester: 'السنة الثالثة', subjects: ['هندسة البرمجيات', 'الذكاء الاصطناعي', 'مشروع التخرج', 'أمن المعلومات'] }
      ],
      skills: [
        'البرمجة بلغات متعددة',
        'تحليل وتصميم الأنظمة',
        'إدارة قواعد البيانات',
        'أمن المعلومات',
        'العمل الجماعي',
        'حل المشكلات'
      ],
      admission: {
        requirements: 'بكالوريا رياضيات أو علوم تجريبية',
        minScore: 15.0,
        documents: ['شهادة البكالوريا', 'بطاقة التعريف', 'شهادة الميلاد', 'صور شخصية']
      }
    }
  };

  useEffect(() => {
    // Get orientation ID from params
    const orientationId = parseInt(params.id);
    const foundOrientation = orientations[orientationId];
    
    if (foundOrientation) {
      setOrientation(foundOrientation);
    }
  }, [params.id]);

  const tabs = [
    { id: 'overview', label: 'نظرة عامة', icon: BookOpen },
    { id: 'curriculum', label: 'المنهج الدراسي', icon: FileText },
    { id: 'careers', label: 'الفرص المهنية', icon: Briefcase },
    { id: 'admission', label: 'شروط القبول', icon: CheckCircle }
  ];

  if (!orientation) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {orientation.name}
            </h1>
            <p className="text-gray-400 mt-2">{orientation.description}</p>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center">
            <Clock className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{orientation.duration}</div>
            <div className="text-gray-400 text-sm">مدة الدراسة</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center">
            <GraduationCap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{orientation.level}</div>
            <div className="text-gray-400 text-sm">المستوى</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{orientation.popularity}%</div>
            <div className="text-gray-400 text-sm">الشعبية</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 text-center">
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{orientation.averageScore}</div>
            <div className="text-gray-400 text-sm">المعدل المطلوب</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl mb-8">
          <div className="flex border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-cyan-400 bg-gray-700/50 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">وصف التخصص</h3>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {orientation.fullDescription}
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">المهارات المكتسبة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orientation.skills.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span className="text-gray-300">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold text-white mb-4">الجامعات المتاحة</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orientation.universities.map((uni, index) => (
                      <div key={index} className="bg-gray-700/30 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">{uni.name}</h4>
                        <div className="flex items-center text-gray-400 text-sm mb-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {uni.location}
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Users className="w-4 h-4 mr-1" />
                          {uni.seats} مقعد
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white mb-4">المنهج الدراسي</h3>
                {orientation.curriculum.map((year, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-xl p-6">
                    <h4 className="text-xl font-semibold text-cyan-400 mb-4">{year.semester}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {year.subjects.map((subject, subIndex) => (
                        <div key={subIndex} className="flex items-center">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                          <span className="text-gray-300">{subject}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'careers' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white mb-4">الفرص المهنية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {orientation.prospects.map((job, index) => (
                    <div key={index} className="bg-gray-700/30 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-white mb-3">{job.title}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">الراتب:</span>
                          <span className="text-green-400 font-semibold">{job.salary}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">الطلب:</span>
                          <span className={`font-semibold ${
                            job.demand === 'عالي جداً' ? 'text-red-400' :
                            job.demand === 'عالي' ? 'text-orange-400' :
                            'text-yellow-400'
                          }`}>
                            {job.demand}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'admission' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white mb-4">شروط القبول</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700/30 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-4">المتطلبات الأساسية</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">نوع البكالوريا:</span>
                        <span className="text-white">{orientation.admission.requirements}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">المعدل الأدنى:</span>
                        <span className="text-cyan-400 font-semibold">{orientation.admission.minScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700/30 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-4">الوثائق المطلوبة</h4>
                    <div className="space-y-2">
                      {orientation.admission.documents.map((doc, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                          <span className="text-gray-300 text-sm">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => router.push('/comparison/tool')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            مقارنة مع تخصصات أخرى
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/calcul')}
            className="border-cyan-500 text-cyan-300 hover:bg-cyan-500/10 px-8 py-3"
          >
            <Star className="w-5 h-5 mr-2" />
            حساب فرص القبول
          </Button>
        </div>
      </div>
    </div>
  );
}
