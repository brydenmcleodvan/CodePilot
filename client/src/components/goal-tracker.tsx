
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Persist a numeric value in localStorage
const usePersistedNumber = (key: string, initial: number) => {
  const [value, setValue] = useState<number>(() => {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    return stored ? parseInt(stored, 10) : initial
  })

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, String(value))
    }
  }, [key, value])

  return [value, setValue] as const
}

export const GoalTracker = () => {
  const todayKey = new Date().toISOString().split('T')[0]

  const [stepGoal, setStepGoal] = usePersistedNumber('stepGoal', 10000)
  const [hydrationGoal, setHydrationGoal] = usePersistedNumber('hydrationGoal', 8)
  const [stepsToday, setStepsToday] = usePersistedNumber(`steps_${todayKey}`, 0)
  const [waterToday, setWaterToday] = usePersistedNumber(`water_${todayKey}`, 0)

  const [stepInput, setStepInput] = useState('')
  const [waterInput, setWaterInput] = useState('')

  const addSteps = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(stepInput, 10) || 0
    setStepsToday((s) => s + val)
    setStepInput('')
  }

  const addWater = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseInt(waterInput, 10) || 0
    setWaterToday((w) => w + val)
    setWaterInput('')
  }

  const stepProgress = Math.min((stepsToday / stepGoal) * 100, 100)
  const waterProgress = Math.min((waterToday / hydrationGoal) * 100, 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h4 className="font-medium">Steps</h4>
          <div className="flex items-center space-x-2 mb-2">
            <Input
              type="number"
              value={stepGoal}
              onChange={(e) => setStepGoal(parseInt(e.target.value, 10) || 0)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">goal</span>
          </div>
          <form onSubmit={addSteps} className="flex items-center space-x-2 mb-2">
            <Input
              type="number"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              placeholder="Add steps"
              className="w-24"
            />
            <Button type="submit" variant="outline" size="sm">
              Add
            </Button>
          </form>
          <div className="flex justify-between text-sm">
            <span>
              {stepsToday}/{stepGoal} steps
            </span>
            <span>{Math.round(stepProgress)}%</span>
          </div>
          <Progress value={stepProgress} />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Hydration</h4>
          <div className="flex items-center space-x-2 mb-2">
            <Input
              type="number"
              value={hydrationGoal}
              onChange={(e) => setHydrationGoal(parseInt(e.target.value, 10) || 0)}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">glasses</span>
          </div>
          <form onSubmit={addWater} className="flex items-center space-x-2 mb-2">
            <Input
              type="number"
              value={waterInput}
              onChange={(e) => setWaterInput(e.target.value)}
              placeholder="Add glasses"
              className="w-24"
            />
            <Button type="submit" variant="outline" size="sm">
              Add
            </Button>
          </form>
          <div className="flex justify-between text-sm">
            <span>
              {waterToday}/{hydrationGoal} glasses
            </span>
            <span>{Math.round(waterProgress)}%</span>
          </div>
          <Progress value={waterProgress} />
        </div>
      </CardContent>
    </Card>
  )
}
