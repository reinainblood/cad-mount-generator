import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface MountingQuestionnaireProps {
  productData: any;
  onRequirementsComplete: (requirements: any) => void;
}

interface Question {
  id: string;
  text: string;
  options?: string[];
  type?: "number" | "checkbox";
}

export default function MountingQuestionnaire({ 
  productData, 
  onRequirementsComplete 
}: MountingQuestionnaireProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  const isComputeModule = productData?.productType === 'compute_module';

  const questions: Question[] = [
    {
      id: "mountType",
      text: "How would you like to mount this?",
      options: ["Wall", "Desktop", "Under-desk", "Rack", "Custom"],
    },
    ...(isComputeModule ? [{
      id: "cooling",
      text: "What type of cooling do you need?",
      options: ["Passive", "Active (Fan)", "Custom"],
    }] : []),
    {
      id: "orientation",
      text: "What orientation do you need?",
      options: ["Vertical", "Horizontal", "Adjustable"],
    },
    {
      id: "clearance",
      text: "How much clearance do you need (mm)?",
      type: "number",
    },
    ...(isComputeModule ? [{
      id: "accessories",
      text: "Additional features needed?",
      type: "checkbox",
      options: [
        "GPIO Access",
        "Fan Mount",
        "Heat Sink",
        "Camera Mount",
        "Display Mount"
      ],
    }] : [])
  ];

  const currentQuestion = questions[step];

  const handleAnswer = (value: string | string[]) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      onRequirementsComplete({
        ...answers,
        [currentQuestion.id]: value,
        productType: productData.productType
      });
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">{currentQuestion.text}</h3>

      {currentQuestion.type === "number" ? (
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Enter value in mm"
            onChange={(e) => handleAnswer(e.target.value)}
          />
        </div>
      ) : currentQuestion.type === "checkbox" && currentQuestion.options ? (
        <div className="space-y-2">
          {currentQuestion.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                onCheckedChange={(checked) => {
                  const currentAnswers = answers[currentQuestion.id] || [];
                  const newAnswers = checked
                    ? [...currentAnswers, option]
                    : currentAnswers.filter((a: string) => a !== option);
                  handleAnswer(newAnswers);
                }}
              />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
          <Button 
            onClick={() => {
              if (step < questions.length - 1) {
                setStep(step + 1);
              } else {
                onRequirementsComplete(answers);
              }
            }}
            className="mt-4"
          >
            Next
          </Button>
        </div>
      ) : currentQuestion.options ? (
        <RadioGroup onValueChange={handleAnswer}>
          {currentQuestion.options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <RadioGroupItem value={option} id={option} />
              <Label htmlFor={option}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      ) : null}
    </div>
  );
}