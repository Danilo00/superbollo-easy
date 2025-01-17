'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { HelpCircle } from 'lucide-react'
import { 
  convertCVtoKW, 
  calculateVehicleAge, 
  calculateBaseAmount,
  calculatePenalty,
  calculateInterest
} from '../utils/calculations'
import Image from 'next/image'

export default function SuperBolloCalculator() {
  const [targa, setTarga] = useState('')
  const [potenza, setPotenza] = useState('')
  const [unitaPotenza, setUnitaPotenza] = useState('KW')
  const [dataImmatricolazione, setDataImmatricolazione] = useState('')
  const [dataScadenza, setDataScadenza] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [risultato, setRisultato] = useState<{
    url: string;
    dettagli: {
      imposta: number;
      sanzione: number;
      interessi: number;
      totale: number;
    } | null;
  } | null>(null)
  const [rangeEta, setRangeEta] = useState<string>('')
  const [metodoDeterminazioneEta, setMetodoDeterminazioneEta] = useState<'data' | 'range'>('data')

  const calcolaSuperBollo = () => {
    // Convert power to KW if needed
    const potenzaKW = unitaPotenza === 'CV' 
      ? convertCVtoKW(Number(potenza))
      : Number(potenza);

    // Calculate vehicle age
    const eta = calculateVehicleAge(dataImmatricolazione);

    // Calculate base amount (codice tributo 3364)
    const imposta = calculateBaseAmount(potenzaKW, eta);

    // Calculate days late
    const dataScadenzaDate = new Date(dataScadenza);
    const dataPagamentoDate = new Date(dataPagamento);
    const daysLate = Math.max(0, Math.floor((dataPagamentoDate.getTime() - dataScadenzaDate.getTime()) / (1000 * 60 * 60 * 24)));

    // Calculate penalty (codice tributo 3365)
    const sanzione = calculatePenalty(imposta, daysLate);

    // Calculate interest (codice tributo 3366)
    const interessi = calculateInterest(imposta, dataScadenza, dataPagamento);

    // Calculate total
    const totale = imposta + sanzione + interessi;

    // Generate URL
    const url = `https://online.aci.it/acinet/calcolobollo/PopupF24SuperBollo.asp?l=i&targa=${targa}&anno=${new Date().getFullYear()}&t=${totale.toFixed(2)}&imp=${imposta.toFixed(2)}&san=${sanzione.toFixed(2)}&int=${interessi.toFixed(2)}`;

    setRisultato({
      url,
      dettagli: {
        imposta,
        sanzione,
        interessi,
        totale
      }
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
        <Image
          src="https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?auto=format&fit=crop&w=900&h=1600&q=80"
          alt="Sfondo con auto sportiva"
          layout="fill"
          objectFit="cover"
          quality={100}
          className="opacity-30"
        />
        <div className="w-full max-w-2xl mx-auto p-4 relative z-10">
          <Alert variant="destructive" className="mb-6 w-full">
  <AlertTitle>Sapevi che se calcoli l'F24 oggi e lo paghi domani, potresti avere una multa?</AlertTitle>
  <AlertDescription>
    <ul className="list-disc list-inside space-y-1">
      <li>Il calcolo del SuperBollo richiede estrema precisione: anche un solo giorno di differenza può alterare significativamente il risultato.</li>
      <li>Gli interessi vengono calcolati giorno per giorno, considerando i tassi di interesse legale che variano annualmente:</li>
      <ul className="list-disc list-inside ml-4">
        <li>5% nel 2023</li>
        <li>2,5% nel 2024</li>
        <li>2% nel 2025 e oltre</li>
      </ul>
      <li>Per un calcolo accurato, è necessario suddividere i giorni di ritardo per anno e applicare i rispettivi tassi.</li>
      <li><strong>Importante:</strong> Si raccomanda vivamente di effettuare il pagamento lo stesso giorno del calcolo per evitare discrepanze e possibili sanzioni.</li>
    </ul>
  </AlertDescription>
</Alert>

          <Alert className="mb-6 w-full">
            <AlertDescription>
              <p><strong>Esempio di calcolo complesso:</strong></p>
              <p>Per un'auto di 320 CV (235,36 kW), immatricolata 6 anni fa, con SuperBollo scaduto il 01/04/2024 e pagato il 10/01/2025:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Imposta: €603,60 ((235,36 - 185) * €20 * 0,6)</li>
                <li>Sanzione: €22,64 (3,75% dell'imposta per ritardo tra 91 e 365 giorni)</li>
                <li>Interessi: €11,83 (calcolati come segue)
                  <ul className="list-disc list-inside ml-4">
                    <li>Dal 01/04/2024 al 31/12/2024 (275 giorni al 2,5%): €11,36</li>
                    <li>Dal 01/01/2025 al 10/01/2025 (10 giorni al 2%): €0,47</li>
                  </ul>
                </li>
                <li>Totale: €638,07</li>
              </ul>
              <p className="mt-2">Questo esempio mostra la complessità del calcolo, specialmente per gli interessi che si estendono su due anni con tassi diversi. Inserisci i tuoi dati nel calcolatore per ottenere un risultato preciso per la tua situazione.</p>
            </AlertDescription>
          </Alert>
          <Card className="w-full bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Calcolatore SuperBollo</CardTitle>
              <CardDescription>Inserisci i dati per calcolare il SuperBollo e generare l'F24</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="targa">Targa Auto</Label>
                <Input 
                  id="targa" 
                  value={targa} 
                  onChange={(e) => setTarga(e.target.value.toUpperCase())}
                  placeholder="Es. AB123CD"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="potenza">Potenza</Label>
                  <Input 
                    id="potenza" 
                    type="number" 
                    value={potenza} 
                    onChange={(e) => setPotenza(e.target.value)}
                    placeholder="Inserisci la potenza"
                  />
                </div>
                <div className="w-1/3 space-y-2">
                  <Label htmlFor="unitaPotenza">Unità</Label>
                  <Select value={unitaPotenza} onValueChange={setUnitaPotenza}>
                    <SelectTrigger id="unitaPotenza">
                      <SelectValue placeholder="Seleziona unità" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KW">KW</SelectItem>
                      <SelectItem value="CV">CV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-4">
                <Label>Determinazione età del veicolo</Label>
                <RadioGroup 
                  value={metodoDeterminazioneEta} 
                  onValueChange={(value) => setMetodoDeterminazioneEta(value as 'data' | 'range')}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="data" id="data" />
                    <Label htmlFor="data">Data prima immatricolazione</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="range" id="range" />
                    <Label htmlFor="range">Range di età</Label>
                  </div>
                </RadioGroup>
                {metodoDeterminazioneEta === 'data' ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="dataImmatricolazione">Data prima immatricolazione</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fa fede la data di prima immatricolazione più vecchia, anche in caso di importazione dall'estero. Questo garantisce il corretto calcolo delle agevolazioni basate sull'età del veicolo.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input 
                      id="dataImmatricolazione" 
                      type="date" 
                      value={dataImmatricolazione} 
                      onChange={(e) => setDataImmatricolazione(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="rangeEta">Seleziona il range di età</Label>
                    <Select value={rangeEta} onValueChange={(value) => {
                      setRangeEta(value);
                      const today = new Date();
                      let years;
                      switch(value) {
                        case "0-5":
                          years = 0;
                          break;
                        case "6-10":
                          years = 6;
                          break;
                        case "11-15":
                          years = 11;
                          break;
                        case "15+":
                          years = 16;
                          break;
                        default:
                          return;
                      }
                      const date = new Date();
                      date.setFullYear(today.getFullYear() - years);
                      setDataImmatricolazione(date.toISOString().split('T')[0]);
                    }}>
                      <SelectTrigger id="rangeEta">
                        <SelectValue placeholder="Seleziona range età" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-5">0-5 anni (100% imposta)</SelectItem>
                        <SelectItem value="6-10">6-10 anni (60% imposta)</SelectItem>
                        <SelectItem value="11-15">11-15 anni (30% imposta)</SelectItem>
                        <SelectItem value="15+">Più di 15 anni (esente)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="dataScadenza">Data scadenza del super bollo</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Questa data viene utilizzata per calcolare eventuali sanzioni e interessi. Gli interessi vengono calcolati giornalmente in base ai tassi legali vigenti.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input 
                  id="dataScadenza" 
                  type="date" 
                  value={dataScadenza} 
                  onChange={(e) => setDataScadenza(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataPagamento">Data prevista di pagamento</Label>
                <Input 
                  id="dataPagamento" 
                  type="date" 
                  value={dataPagamento} 
                  onChange={(e) => setDataPagamento(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={calcolaSuperBollo}
                disabled={!targa || !potenza || !dataImmatricolazione || !dataScadenza || !dataPagamento}
              >
                Calcola SuperBollo
              </Button>
              
              {risultato && risultato.dettagli && (
                <>
                  <Alert>
                    <AlertDescription>
                      <div className="space-y-4">
                        <p><strong>Imposta (3364):</strong> €{risultato.dettagli.imposta.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Calcolata come €20 per ogni kW oltre i 185 kW, con riduzioni basate sull'età del veicolo:
                          0-5 anni: 100%, 6-10 anni: 60%, 11-15 anni: 30%, oltre 15 anni: esente.
                        </p>
                        <p><strong>Sanzione (3365):</strong> €{risultato.dettagli.sanzione.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Calcolata in base ai giorni di ritardo: 0.1% al giorno fino a 15 giorni, 1.5% dal 16° al 30° giorno,
                          1.67% dal 31° al 90° giorno, 3.75% dal 91° giorno a 1 anno, 5% oltre 1 anno.
                        </p>
                        <p><strong>Interessi (3366):</strong> €{risultato.dettagli.interessi.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          Calcolati giornalmente in base ai tassi legali vigenti: 5% per il 2023, 2.5% per il 2024, 2% dal 2025 in poi.
                        </p>
                        <p><strong>Totale:</strong> €{risultato.dettagli.totale.toFixed(2)}</p>
                        <p className="mt-4"><strong>Link per F24:</strong></p>
                        <a 
                          href={risultato.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline break-all"
                        >
                          {risultato.url}
                        </a>
                      </div>
                    </AlertDescription>
                  </Alert>
                  <Alert variant="warning" className="mt-4">
                    <AlertDescription>
                      Si consiglia di generare e pagare l'F24 il giorno stesso del calcolo per evitare differenze negli interessi dovute al calcolo giornaliero.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </CardContent>
          </Card>
          <div className="mt-4 text-center text-sm text-gray-500 w-full">
            <p>Disclaimer: Questo calcolatore è fornito a solo scopo informativo. I risultati potrebbero non essere accurati al 100% e non sostituiscono il calcolo ufficiale. Si prega di verificare sempre con le autorità competenti per il calcolo esatto del SuperBollo.</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

