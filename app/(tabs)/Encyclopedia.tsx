import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  ScrollView,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import "../../global.css";
import { Link } from "expo-router";
import { Asset } from "expo-asset";

const { width } = Dimensions.get("window");
const resolveAssetUri = (requirePath: any): string =>
  Asset.fromModule(requirePath).uri;

const data = [
  {
    id: "1",
    title: "Ganja (Cannabis)",
    description: "Active Compound: Delta-9-tetrahydrocannabinol (THC)",
    image: require("../../assets/images/Cannabis.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/Cannabis.png")),
    color: "bg-green-100",
    category: "Psychoactive Drug",
    form: "Dried Flower, Edibles",
    contraindications: "History of psychosis or schizophrenia, Alcohol dependency",
    sideEffects: "Headache, Drowsiness, Nausea, Dizziness",
    law: "Section 20: Punishment for the production, manufacture, possession, sale, purchase, transport, import inter-State, export inter-State, or use of cannabis.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "2",
    title: "MDMA (Ecstasy)",
    description: "Active Compound: 3,4-Methylenedioxymethamphetamine (MDMA)",
    image: require("../../assets/images/mdma.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/mdma.png")),
    color: "bg-blue-100",
    category: "Psychoactive Stimulant and Empathogen",
    form: "Tablets, Capsules, Powder",
    contraindications: "Epilepsy, High blood pressure, Heart disease, Mood or psychiatric disorders",
    sideEffects: "Euphoria, Increased heart rate and blood pressure, Nausea, Anxiety and depression post-use",
    law: "Section 22: Punishment for possession, sale, or transport of psychotropic substances.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "3",
    title: "Hashish (Charas)",
    description: "Active Compound: THC (similar to cannabis)",
    image: require("../../assets/images/hashish.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/hashish.png")),
    color: "bg-amber-100",
    category: "Psychoactive Drug",
    form: "Solid Resin, Edibles",
    contraindications: "History of mental health issues (similar to cannabis)",
    sideEffects: "Impaired memory and concentration, Anxiety or paranoia, Increased heart rate",
    law: "Section 20: Same as for cannabis.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "4",
    title: "Brown Sugar (Heroin)",
    description: "Active Compound: Diacetylmorphine",
    image: require("../../assets/images/Heroin.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/Heroin.png")),
    color: "bg-red-100",
    category: "Opioid Narcotic",
    form: "Powder, Sticky Substance (Black Tar)",
    contraindications: "Respiratory issues, History of substance use disorder",
    sideEffects: "Euphoria followed by sedation, Nausea and vomiting, Constipation",
    law: "Section 21: Punishment for possession, sale, or transport of manufactured drugs.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "5",
    title: "Methamphetamine",
    description: "Active Compound: Methamphetamine Hydrochloride",
    image: require("../../assets/images/Methamphetamine.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/Methamphetamine.png")),
    color: "bg-purple-100",
    category: "Stimulant",
    form: "Crystal, Powder, Pills",
    contraindications: "Heart disease, Severe anxiety or mood disorders",
    sideEffects: "Increased energy and alertness, Elevated heart rate, Anxiety and paranoia",
    law: "Section 22: Same as for psychotropic substances.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "6",
    title: "LSD (Lysergic Acid Diethylamide)",
    description: "Active Compound: Lysergic Acid Diethylamide",
    image: require("../../assets/images/LSD.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/LSD.png")),
    color: "bg-yellow-100",
    category: "Hallucinogen",
    form: "Blotter Paper, Liquid",
    contraindications: "History of psychosis or schizophrenia",
    sideEffects: "Visual hallucinations, Altered sense of time, Anxiety and paranoia",
    law: "Section 22: Same as for psychotropic substances.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "7",
    title: "Prescription Stimulants (e.g., Ritalin, Adderall)",
    description: "Active Compound: Methylphenidate or Amphetamine Salts",
    image: require("../../assets/images/PrescriptionStimulants.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/PrescriptionStimulants.png")),
    color: "bg-orange-100",
    category: "Stimulant",
    form: "Tablets, Capsules",
    contraindications: "Heart problems, Hyperthyroidism",
    sideEffects: "Insomnia, Decreased appetite, Anxiety",
    law: "Section 22: Same as for psychotropic substances.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "8",
    title: "Sedatives (e.g., Xanax, Valium)",
    description: "Active Compound: Alprazolam (Xanax) or Diazepam (Valium)",
    image: require("../../assets/images/Sedatives.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/Sedatives.png")),
    color: "bg-pink-100",
    category: "Benzodiazepine",
    form: "Tablets, Liquid",
    contraindications: "Respiratory issues, History of substance abuse",
    sideEffects: "Drowsiness, Confusion, Impaired coordination",
    law: "Section 22: Same as for psychotropic substances.",
    punishments: "Small Quantity: Up to 1 year imprisonment or fine up to ₹10,000, or both.#Medium Quantity: Up to 10 years imprisonment and fine up to ₹1,00,000.#Commercial Quantity: Rigorous imprisonment of 10 to 20 years and fine of ₹1,00,000 to ₹2,00,000."
  },
  {
    id: "9",
    title: "Tobacco Products",
    description: "Active Compound: Nicotine",
    image: require("../../assets/images/Tobacco.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/Tobacco.png")),
    color: "bg-gray-100",
    category: "Stimulant/Narcotic",
    form: "Cigarettes, Chewing Tobacco, Vaping Products",
    contraindications: "Cardiovascular disease, Respiratory issues",
    sideEffects: "Increased heart rate, Addiction potential",
    law: "Section 4: Prohibition of smoking in public places and sale to minors.",
    punishments: "Sale to minors: Fine of ₹200 for the first offense, increasing with each subsequent offense.#Public Smoking: Fine of ₹200 to ₹500 for smoking in public places."
  },
  {
    id: "10",
    title: "Alcohol",
    description: "Active Compound: Ethanol",
    image: require("../../assets/images/Alcohol.png"),
    resolvedUri: resolveAssetUri(require("../../assets/images/Alcohol.png")),
    color: "bg-green-100",
    category: "Depressant",
    form: "Liquor, Beer, Wine",
    contraindications: "Liver disease, History of alcohol use disorder, Pregnancy",
    sideEffects: "Impaired judgment, Drowsiness, Nausea",
    law: "Section 185: Driving under the influence of alcohol or drugs.",
    punishments: "Driving: Imprisonment of up to 6 months or fine up to ₹2,000, or both.#Public Drinking: Fine of ₹500 to ₹2,000 for drinking in public places."
  }
];


const Encyclopedia = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = ({ item }: { item: Item }) => (
    <Link
      href={{
        pathname: "/DisplayCard",
        params: {
          image: item.resolvedUri, 
          title: item.title,
          description: item.description,
          category: item.category,
          form: item.form,
          contraindications: item.contraindications,
          sideEffects: item.sideEffects,
          law: item.law,
          punishments: item.punishments,
        },
      }}
    >
      <View
        className={`${item.color} rounded-2xl shadow-lg p-6 m-4 items-center flex-1 mx-2`}
        style={{ width: width - 64, height: 530 }}
      >
        <Image
          source={item.image} 
          style={{
            width: "100%",
            height: 200,
            resizeMode: "contain",
            borderRadius: 10,
          }}
        />
        <Text className="text-2xl font-bold text-black mt-4">{item.title}</Text>
        <Text className="text-center text-grey-600 mt-2">
          {item.description}
        </Text>
      </View>
    </Link>
  );

  interface Item {
    id: string;
    title: string;
    description: string;
    image: any;
    resolvedUri: string;
    color: string;
    category: string;
    form: string;
    contraindications: string;
    sideEffects: string;
    law: string;
    punishments: string;
  }

  interface ScrollEvent {
    nativeEvent: {
      layoutMeasurement: {
        width: number;
      };
      contentOffset: {
        x: number;
      };
    };
  }

  const onScroll = (event: ScrollEvent) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
    setActiveIndex(index);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar */}
      <View className="px-4 py-4 bg-white flex-row items-center">
        <View className="flex-row bg-white py-2 px-6 rounded-2xl shadow flex-1 items-center">
          <TextInput placeholder="Search" className="text-lg flex-1" />
          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/searchicon.png")}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-4 py-4 flex-col justify-between">
        <View className="flex-1">
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 40}
            snapToAlignment="center"
            decelerationRate={0.8}
            onMomentumScrollEnd={onScroll}
            contentContainerStyle={{ 
              paddingHorizontal: width / 2 - (width - 80) / 2,
            }}
            ItemSeparatorComponent={() => <View style={{ width: 20 }} />}
            bounces={true}
            bouncesZoom={true}
            showsVerticalScrollIndicator={false}
            fadingEdgeLength={100}
            overScrollMode="never"
            scrollEventThrottle={16}
            onScroll={(e) => {
              onScroll(e);
              // Add subtle scale effect based on scroll position
              const scrollX = e.nativeEvent.contentOffset.x;
              const slideSize = e.nativeEvent.layoutMeasurement.width;
              const currentIndex = Math.floor(scrollX / slideSize);
              const offset = scrollX - currentIndex * slideSize;
              const percent = offset / slideSize;
              
              // Animation logic can be expanded here if needed
            }}
          />
        </View>
        <View className="flex-row justify-center py-4">
          {data.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 rounded-full mx-1 ${
                index === activeIndex ? "bg-black" : "bg-gray-400"
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default Encyclopedia;