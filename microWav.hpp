#pragma once

#include <stdint.h>
#include <stdio.h>
#include <assert.h>
#include <vector>
#include <string>

//micro library for loading and saving wav files, of mono 16bit per sample size
//in memory representation is float

typedef struct {
  uint32_t chunkID;
  uint32_t chunkSize;
  uint32_t format;
  uint32_t subchunk1ID;
  uint32_t subchunk1Size;
  uint16_t audioFormat;
  uint16_t numChannels;
  uint32_t sampleRate;
  uint32_t byteRate;
  uint16_t blockAlign;
  uint16_t bitsPerSample;
  uint32_t subchunk2ID;
  uint32_t subchunk2Size;
} wavHeader;

std::vector<float> wavRead(std::string &path, uint32_t &samplerate){
	printf("loading %s\n",path.c_str());
	FILE* f = fopen(path.c_str(), "rb");
	wavHeader head;
	fread(&head,44,1,f);
	assert(head.chunkID == 0x46464952);
	assert(head.format == 0x45564157);
	assert(head.subchunk1ID == 0x20746d66);
	assert(head.subchunk2ID == 0x61746164);
	assert(head.numChannels == 1);
	
	assert(head.bitsPerSample == 16);//16bit
	
	samplerate = head.sampleRate;
	std::vector<float> out;
	
	int16_t sample;
	uint32_t i;
	for(i=0;i<head.subchunk2Size;i+=2){
		fread(&sample,2,1,f);
		out.push_back((float)sample/32768.f);
	}
	fclose(f);
	return out;
}

void wavWrite(std::string path, std::vector<float> &data, uint32_t samplerate){
	wavHeader head = (wavHeader){0x46464952,data.size()*2+36,0x45564157,0x20746d66,16,1,1,samplerate,samplerate*2,2,16,0x61746164,data.size()*2};//header for a 16bpm, mono, wav file
	FILE* f = fopen(path.c_str(), "wb");
	fwrite(&head,44,1,f);
	int16_t sample;
	uint32_t i;
	for(i=0;i<data.size();i++){
		sample = (int)(32768.f*data[i]);
		fwrite(&sample,2,1,f);
	}
	fclose(f);
}
