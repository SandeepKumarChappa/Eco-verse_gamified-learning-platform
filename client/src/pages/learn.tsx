import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Play, BookOpen, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Module {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  points: number;
  content: string;
  quiz?: Quiz;
  completed?: boolean;
}

interface Quiz {
  questions: Question[];
}

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const initialModules: Module[] = [
  {
    id: "climate",
    title: "Climate Change",
    description: "Understanding global warming, greenhouse effect, and climate impacts",
    progress: 0,
    lessons: [
      {
        id: "1",
        title: "What is Climate Change?",
        duration: "10 minutes",
        points: 50,
        content: `
          <h2>Understanding Climate Change</h2>
          <p>Climate change refers to long-term shifts in global temperatures and weather patterns. While climate variations are natural, scientific evidence shows that human activities have been the main driver of climate change since the 1800s.</p>
          <h3>Key Concepts:</h3>
          <ul>
            <li><strong>Greenhouse Effect:</strong> The process by which Earth's atmosphere traps heat from the sun</li>
            <li><strong>Greenhouse Gases:</strong> CO₂, methane, nitrous oxide, and other gases that trap heat</li>
            <li><strong>Global Warming:</strong> The long-term increase in Earth's average surface temperature</li>
          </ul>
          <p>🌡️ <strong>Temperature Rise Since 1880</strong><br/>Earth's global average temperature has risen by approximately 1.1°C (2°F) since 1880.</p>
          <h3>Main Causes:</h3>
          <ul>
            <li>Burning fossil fuels (coal, oil, gas)</li>
            <li>Deforestation</li>
            <li>Industrial processes</li>
            <li>Agriculture and livestock</li>
          </ul>
        `,
        quiz: {
          questions: [
            {
              question: "What is the primary cause of current climate change?",
              options: ["Natural climate variations", "Solar radiation changes", "Human activities (burning fossil fuels)", "Volcanic eruptions"],
              correct: 2
            },
            {
              question: "By how much has Earth's global average temperature risen since 1880?",
              options: ["0.5°C (0.9°F)", "1.1°C (2°F)", "2.0°C (3.6°F)", "3.0°C (5.4°F)"],
              correct: 1
            },
            {
              question: "Which of the following is NOT a major greenhouse gas?",
              options: ["Carbon dioxide (CO₂)", "Methane (CH₄)", "Oxygen (O₂)", "Nitrous oxide (N₂O)"],
              correct: 2
            }
          ]
        }
      },
      {
        id: "2",
        title: "Effects of Climate Change",
        duration: "12 minutes",
        points: 60,
        content: `
          <h2>Climate Change Impacts</h2>
          <p>Climate change affects every corner of our planet and impacts humans, animals, and ecosystems in numerous ways.</p>
          <h3>Environmental Effects:</h3>
          <ul>
            <li>Rising sea levels</li>
            <li>Melting ice caps and glaciers</li>
            <li>More frequent extreme weather events</li>
            <li>Changes in precipitation patterns</li>
            <li>Ocean acidification</li>
          </ul>
          <h3>Impact on India:</h3>
          <p>🇮🇳 Specific Impacts on India:</p>
          <ul>
            <li>Monsoon pattern changes affecting agriculture</li>
            <li>Himalayan glacier retreat affecting water supply</li>
            <li>Increased heat waves and extreme temperatures</li>
            <li>Coastal flooding in cities like Mumbai and Chennai</li>
            <li>Drought in some regions, floods in others</li>
          </ul>
          <h3>Biodiversity Loss:</h3>
          <p>Climate change threatens species survival through habitat loss, changing migration patterns, and ecosystem disruption.</p>
        `
      }
    ]
  },
  {
    id: "biodiversity",
    title: "Biodiversity",
    description: "Explore ecosystems, wildlife conservation, and species protection",
    progress: 0,
    lessons: [
      {
        id: "1",
        title: "What is Biodiversity?",
        duration: "15 minutes",
        points: 70,
        content: `
          <h2>Understanding Biodiversity</h2>
          <p>Biodiversity, short for biological diversity, refers to the variety of life on Earth at all its levels, from genes to ecosystems.</p>
          <h3>Three Levels of Biodiversity:</h3>
          <ul>
            <li><strong>Genetic Diversity:</strong> Variety within species</li>
            <li><strong>Species Diversity:</strong> Variety of species in an ecosystem</li>
            <li><strong>Ecosystem Diversity:</strong> Variety of habitats and ecosystems</li>
          </ul>
          <p>🇮🇳 India's Biodiversity Hotspots:</p>
          <ul>
            <li>Western Ghats: Home to 7,402 species of flowering plants</li>
            <li>Eastern Himalayas: 163 globally threatened species</li>
            <li>Indo-Burma: Over 13,500 plant species</li>
            <li>Sundaland: Rich marine biodiversity</li>
          </ul>
          <h3>Why Biodiversity Matters:</h3>
          <ul>
            <li>Ecosystem services (clean air, water filtration)</li>
            <li>Food security and medicine</li>
            <li>Climate regulation</li>
            <li>Cultural and aesthetic value</li>
          </ul>
        `
      }
    ]
  },
  {
    id: "waste",
    title: "Waste Management",
    description: "Learn about recycling, composting, and reducing waste",
    progress: 0,
    lessons: [
      {
        id: "1",
        title: "5 Rs of Waste Management",
        duration: "12 minutes",
        points: 65,
        content: `
          <h2>The 5 Rs Hierarchy</h2>
          <p>The 5 Rs provide a framework for reducing our environmental impact through waste management.</p>
          <ol>
            <li><strong>REFUSE ❌</strong><br/>Say no to items you don't need. Avoid single-use plastics, unnecessary packaging.</li>
            <li><strong>REDUCE 📉</strong><br/>Minimize consumption. Buy only what you need, choose quality over quantity.</li>
            <li><strong>REUSE ♻️</strong><br/>Find new purposes for items. Glass jars as storage, old clothes as cleaning rags.</li>
            <li><strong>RECYCLE 🔄</strong><br/>Process materials into new products. Separate paper, plastic, glass, and metal.</li>
            <li><strong>ROT 🍃</strong><br/>Compost organic waste. Turn food scraps into nutrient-rich soil.</li>
          </ol>
          <p>🇮🇳 Waste Management in India<br/>India generates about 62 million tonnes of waste annually. Only 43 million tonnes are collected, and just 11.9 million tonnes are treated.</p>
        `
      }
    ]
  },
  {
    id: "energy",
    title: "Renewable Energy",
    description: "Discover solar, wind, and other sustainable energy sources",
    progress: 0,
    lessons: [
      {
        id: "1",
        title: "Solar Energy Basics",
        duration: "14 minutes",
        points: 55,
        content: `
          <h2>Solar Energy: Power from the Sun</h2>
          <p>Solar energy is radiant light and heat from the Sun that is harnessed using a range of technologies such as solar power to generate electricity.</p>
          <h3>How Solar Energy Works:</h3>
          <ul>
            <li><strong>Photovoltaic (PV) Cells:</strong> Convert sunlight directly into electricity</li>
            <li><strong>Solar Thermal:</strong> Use sunlight to heat water or air</li>
            <li><strong>Concentrated Solar Power (CSP):</strong> Use mirrors to concentrate sunlight</li>
          </ul>
          <h3>Benefits of Solar Energy:</h3>
          <ul>
            <li>Renewable and abundant</li>
            <li>Reduces greenhouse gas emissions</li>
            <li>Low operating costs after installation</li>
            <li>Creates jobs in the solar industry</li>
          </ul>
          <p>🇮🇳 Solar Potential in India<br/>India receives about 5,000 trillion kWh of solar energy annually, with Rajasthan and Gujarat having the highest potential.</p>
        `,
        quiz: {
          questions: [
            {
              question: "What technology converts sunlight directly into electricity?",
              options: ["Solar thermal", "Concentrated solar power", "Photovoltaic cells", "Solar panels"],
              correct: 2
            },
            {
              question: "Which Indian state has the highest solar energy potential?",
              options: ["Maharashtra", "Karnataka", "Rajasthan", "Tamil Nadu"],
              correct: 2
            }
          ]
        }
      },
      {
        id: "2",
        title: "Wind Energy Fundamentals",
        duration: "13 minutes",
        points: 60,
        content: `
          <h2>Wind Energy: Harnessing Nature's Power</h2>
          <p>Wind energy is the kinetic energy of air in motion, also called wind. It is converted into mechanical power or electricity using wind turbines.</p>
          <h3>Wind Turbine Components:</h3>
          <ul>
            <li><strong>Blades:</strong> Capture wind energy and rotate</li>
            <li><strong>Rotor:</strong> Connects blades to the generator</li>
            <li><strong>Tower:</strong> Elevates turbine to access stronger winds</li>
            <li><strong>Nacelle:</strong> Houses the generator and gearbox</li>
          </ul>
          <h3>Advantages:</h3>
          <ul>
            <li>Clean and renewable energy source</li>
            <li>Low greenhouse gas emissions</li>
            <li>Creates employment opportunities</li>
            <li>Can be installed on land or offshore</li>
          </ul>
          <p>🇮🇳 Wind Energy in India<br/>India has the 4th largest wind power capacity globally, with Tamil Nadu, Gujarat, and Karnataka leading in installation.</p>
        `
      }
    ]
  },
  {
    id: "water",
    title: "Water Conservation",
    description: "Learn about water scarcity, conservation methods, and protection",
    progress: 0,
    lessons: [
      {
        id: "1",
        title: "Water Scarcity and Conservation",
        duration: "16 minutes",
        points: 75,
        content: `
          <h2>Understanding Water Scarcity</h2>
          <p>Water scarcity occurs when the demand for water exceeds the available amount, or when poor quality restricts its use. It's a growing global concern affecting billions of people.</p>
          <h3>Causes of Water Scarcity:</h3>
          <ul>
            <li>Population growth and urbanization</li>
            <li>Climate change altering precipitation patterns</li>
            <li>Pollution of water sources</li>
            <li>Over-extraction of groundwater</li>
            <li>Inefficient water use in agriculture</li>
          </ul>
          <h3>Water Conservation Methods:</h3>
          <ul>
            <li><strong>Fix Leaks:</strong> Repair dripping faucets and toilets</li>
            <li><strong>Shorter Showers:</strong> Reduce shower time to 5 minutes</li>
            <li><strong>Efficient Appliances:</strong> Use low-flow showerheads and toilets</li>
            <li><strong>Rainwater Harvesting:</strong> Collect and store rainwater</li>
            <li><strong>Xeriscaping:</strong> Use drought-resistant plants in landscaping</li>
          </ul>
          <p>🇮🇳 Water Crisis in India<br/>Over 600 million Indians face high to extreme water stress. States like Rajasthan, Punjab, and Haryana are particularly affected.</p>
        `,
        quiz: {
          questions: [
            {
              question: "What is the main cause of water scarcity in urban areas?",
              options: ["Climate change", "Population growth and urbanization", "Deforestation", "Industrial pollution"],
              correct: 1
            },
            {
              question: "Which water conservation method involves collecting and storing rainwater?",
              options: ["Xeriscaping", "Rainwater harvesting", "Fixing leaks", "Shorter showers"],
              correct: 1
            }
          ]
        }
      },
      {
        id: "2",
        title: "Sustainable Water Management",
        duration: "18 minutes",
        points: 80,
        content: `
          <h2>Sustainable Water Management Practices</h2>
          <p>Sustainable water management involves using water efficiently and protecting water resources for future generations.</p>
          <h3>Key Principles:</h3>
          <ul>
            <li><strong>Integrated Water Resources Management (IWRM):</strong> Coordinating development and management of water</li>
            <li><strong>Water-Energy-Food Nexus:</strong> Understanding interconnections between these resources</li>
            <li><strong>Circular Economy:</strong> Treating water as a reusable resource</li>
          </ul>
          <h3>Technologies for Water Conservation:</h3>
          <ul>
            <li>Drip irrigation systems</li>
            <li>Greywater recycling systems</li>
            <li>Smart water meters</li>
            <li>Desalination technologies</li>
            <li>Wastewater treatment and reuse</li>
          </ul>
          <p>🇮🇳 India's Water Management Initiatives<br/>The government has launched programs like Jal Jeevan Mission and Atal Bhujal Yojana to improve water availability and quality.</p>
        `
      }
    ]
  },
  {
    id: "pollution",
    title: "Pollution Control",
    description: "Understanding air, water, and soil pollution and solutions",
    progress: 0,
    lessons: [
      {
        id: "1",
        title: "Air Pollution: Causes and Effects",
        duration: "15 minutes",
        points: 65,
        content: `
          <h2>Understanding Air Pollution</h2>
          <p>Air pollution is the contamination of air by harmful substances that can cause adverse effects on human health and the environment.</p>
          <h3>Major Air Pollutants:</h3>
          <ul>
            <li><strong>Particulate Matter (PM):</strong> Tiny particles that can penetrate deep into lungs</li>
            <li><strong>Nitrogen Dioxide (NO₂):</strong> From vehicle exhaust and power plants</li>
            <li><strong>Sulfur Dioxide (SO₂):</strong> From burning fossil fuels</li>
            <li><strong>Ozone (O₃):</strong> Ground-level ozone is harmful to breathe</li>
            <li><strong>Carbon Monoxide (CO):</strong> Colorless, odorless gas from incomplete combustion</li>
          </ul>
          <h3>Health Effects:</h3>
          <ul>
            <li>Respiratory problems (asthma, bronchitis)</li>
            <li>Cardiovascular diseases</li>
            <li>Premature death</li>
            <li>Reduced lung function</li>
          </ul>
          <p>🇮🇳 Air Pollution in India<br/>India has 22 of the world's 30 most polluted cities. Delhi frequently experiences severe air quality issues.</p>
        `,
        quiz: {
          questions: [
            {
              question: "Which air pollutant is primarily from vehicle exhaust?",
              options: ["Sulfur dioxide", "Nitrogen dioxide", "Particulate matter", "Carbon monoxide"],
              correct: 1
            },
            {
              question: "What is India's most polluted city in terms of air quality?",
              options: ["Mumbai", "Kolkata", "Delhi", "Chennai"],
              correct: 2
            }
          ]
        }
      },
      {
        id: "2",
        title: "Water and Soil Pollution Solutions",
        duration: "17 minutes",
        points: 70,
        content: `
          <h2>Combating Water and Soil Pollution</h2>
          <p>Water and soil pollution threaten ecosystems, human health, and food security. Understanding and implementing solutions is crucial.</p>
          <h3>Water Pollution Sources:</h3>
          <ul>
            <li>Industrial wastewater discharge</li>
            <li>Agricultural runoff (pesticides, fertilizers)</li>
            <li>Sewage and domestic waste</li>
            <li>Oil spills and marine pollution</li>
            <li>Plastic pollution</li>
          </ul>
          <h3>Soil Pollution Causes:</h3>
          <ul>
            <li>Industrial waste dumping</li>
            <li>Pesticide and fertilizer overuse</li>
            <li>Mining activities</li>
            <li>Improper waste disposal</li>
            <li>Oil and fuel spills</li>
          </ul>
          <h3>Solutions and Prevention:</h3>
          <ul>
            <li>Proper wastewater treatment</li>
            <li>Sustainable agriculture practices</li>
            <li>Plastic waste reduction</li>
            <li>Soil remediation technologies</li>
            <li>Environmental regulations and monitoring</li>
          </ul>
          <p>🇮🇳 Pollution Control in India<br/>The Central Pollution Control Board (CPCB) monitors pollution levels. Initiatives like Swachh Bharat Mission address waste management.</p>
        `
      }
    ]
  }
];

export default function LearnPage() {
  const { username } = useAuth();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isQuiz, setIsQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userPoints, setUserPoints] = useState(0);

  // Load progress and points from localStorage
  useEffect(() => {
    if (username) {
      const savedProgress = localStorage.getItem(`learnProgress_${username}`);
      const savedPoints = localStorage.getItem(`userPoints_${username}`);

      if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        setModules(prevModules =>
          prevModules.map(module => ({
            ...module,
            progress: progressData[module.id] || 0,
            lessons: module.lessons.map(lesson => ({
              ...lesson,
              completed: progressData[`${module.id}_${lesson.id}`] || false
            }))
          }))
        );
      } else {
        // For new users, initialize all progress to 0
        setModules(prevModules =>
          prevModules.map(module => ({
            ...module,
            progress: 0,
            lessons: module.lessons.map(lesson => ({
              ...lesson,
              completed: false
            }))
          }))
        );
      }

      if (savedPoints) {
        setUserPoints(parseInt(savedPoints));
      } else {
        setUserPoints(0);
      }
    }
  }, [username]);

  // Save progress and points to localStorage
  const saveProgress = (updatedModules: Module[], newPoints: number) => {
    if (username) {
      const progressData: any = {};
      updatedModules.forEach(module => {
        progressData[module.id] = module.progress;
        module.lessons.forEach(lesson => {
          if (lesson.completed) {
            progressData[`${module.id}_${lesson.id}`] = true;
          }
        });
      });
      localStorage.setItem(`learnProgress_${username}`, JSON.stringify(progressData));
      localStorage.setItem(`userPoints_${username}`, newPoints.toString());
    }
  };

  const handleModuleSelect = (module: Module) => {
    setSelectedModule(module);
    setSelectedLesson(null);
    setIsQuiz(false);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsQuiz(false);
  };

  const handleLessonComplete = () => {
    if (selectedLesson && selectedModule) {
      const updatedModules = modules.map(module => {
        if (module.id === selectedModule.id) {
          const updatedLessons = module.lessons.map(l =>
            l.id === selectedLesson.id ? { ...l, completed: true } : l
          );
          const completedLessons = updatedLessons.filter(l => l.completed).length;
          const newProgress = Math.round((completedLessons / updatedLessons.length) * 100);

          return {
            ...module,
            lessons: updatedLessons,
            progress: newProgress
          };
        }
        return module;
      });

      const newPoints = userPoints + (selectedLesson.points || 0);
      setModules(updatedModules);
      setUserPoints(newPoints);
      saveProgress(updatedModules, newPoints);

      // Show completion message
      alert(`Lesson completed! You earned ${selectedLesson.points} EcoPoints!`);
    }
  };

  const handleBack = () => {
    if (isQuiz) {
      setIsQuiz(false);
    } else if (selectedLesson) {
      setSelectedLesson(null);
    } else if (selectedModule) {
      setSelectedModule(null);
    }
  };

  const handleTakeQuiz = () => {
    setIsQuiz(true);
    setQuizAnswers(new Array(selectedLesson?.quiz?.questions.length || 0).fill(-1));
    setQuizSubmitted(false);
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    // Auto-complete lesson after quiz submission
    setTimeout(() => {
      handleLessonComplete();
    }, 2000);
  };

  const handleModuleComplete = (moduleId: string) => {
    const updatedModules = modules.map(module => {
      if (module.id === moduleId) {
        const updatedLessons = module.lessons.map(lesson => ({ ...lesson, completed: true }));
        const newProgress = 100;
        return {
          ...module,
          lessons: updatedLessons,
          progress: newProgress
        };
      }
      return module;
    });
    setModules(updatedModules);
    saveProgress(updatedModules, userPoints);
    alert(`Module completed!`);
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Environmental Learning Hub</h1>
        <p className="text-earth-muted">Explore interactive lessons on environmental science and sustainability</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="bg-[var(--earth-card)] border-[var(--earth-border)] hover:bg-[var(--earth-card)]/80 transition-colors cursor-pointer" onClick={() => handleModuleSelect(module)}>
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {module.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-earth-muted text-sm mb-4">{module.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">Progress: {module.progress}%</span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderModule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="text-white hover:text-earth-cyan">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">{selectedModule?.title}</h1>
        </div>
        <Button onClick={() => handleModuleComplete(selectedModule!.id)} className="bg-earth-orange hover:bg-earth-orange-hover">
          Mark as Complete
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedModule?.lessons.map((lesson, index) => (
          <Card key={lesson.id} className="bg-[var(--earth-card)] border-[var(--earth-border)] hover:bg-[var(--earth-card)]/80 transition-colors cursor-pointer" onClick={() => handleLessonSelect(lesson)}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold mb-2">{lesson.title}</h3>
                  <p className="text-earth-muted text-sm mb-2">{lesson.duration} • {lesson.points} EcoPoints</p>
                </div>
                <Play className="h-5 w-5 text-earth-cyan" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLesson = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="text-white hover:text-earth-cyan">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">{selectedLesson?.title}</h1>
        </div>
        {selectedLesson?.quiz && (
          <Button onClick={handleTakeQuiz} className="bg-earth-orange hover:bg-earth-orange-hover">
            Take Quiz
          </Button>
        )}
      </div>
      <Card className="bg-[var(--earth-card)] border-[var(--earth-border)]">
        <CardContent className="p-6">
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson?.content || "" }} />
        </CardContent>
      </Card>
    </div>
  );

  const renderQuiz = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="text-white hover:text-earth-cyan">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white">{selectedLesson?.title} - Quiz</h1>
        </div>
      </div>
      <Card className="bg-[var(--earth-card)] border-[var(--earth-border)]">
        <CardContent className="p-6">
          {selectedLesson?.quiz?.questions.map((q, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-white font-semibold mb-4">Question {index + 1}</h3>
              <p className="text-earth-muted mb-4">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={optIndex}
                      checked={quizAnswers[index] === optIndex}
                      onChange={() => {
                        const newAnswers = [...quizAnswers];
                        newAnswers[index] = optIndex;
                        setQuizAnswers(newAnswers);
                      }}
                      disabled={quizSubmitted}
                      className="text-earth-cyan"
                    />
                    <span className="text-white">{option}</span>
                  </label>
                ))}
              </div>
              {quizSubmitted && (
                <div className="mt-2">
                  {quizAnswers[index] === q.correct ? (
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Correct
                    </span>
                  ) : (
                    <span className="text-red-400">Incorrect</span>
                  )}
                </div>
              )}
            </div>
          ))}
          {!quizSubmitted && (
            <Button onClick={handleQuizSubmit} className="bg-earth-orange hover:bg-earth-orange-hover">
              Submit Quiz
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-space-gradient text-white p-8">
      <div className="max-w-6xl mx-auto">
        {!selectedModule && renderDashboard()}
        {selectedModule && !selectedLesson && renderModule()}
        {selectedLesson && !isQuiz && renderLesson()}
        {isQuiz && renderQuiz()}
      </div>
    </div>
  );
}
