#include "microWav.hpp"
#include <map>

#include <stdlib.h>

uint32_t reserved = 1048576;//2^20 good for 23sec of sound

void soundAdd(std::vector<float> &a, std::vector<float> &b, uint32_t c){//add a to b starting at c samples
	if((a.size()+c)>b.size()){//if not enough space in b, add more space
		if((a.size()+c)>reserved){
			reserved*=2;
			b.reserve(reserved);
		}
		b.resize(a.size()+c,0.f);//there has got to be a better way to do this when expecting a certain length
	}
	uint32_t i;
	for(i=0;i<a.size();i++){
		b[i+c] += a[i];
	}
}

void anticlip(std::vector<float> &dat, float limit){
	float max=0.f;
	uint32_t i;
	for(i=0;i<dat.size();i++){
		if(dat[i]>max)max=dat[i];
		if((-dat[i])>max)max=-dat[i];
	}
	float mult = limit/max;
	for(i=0;i<dat.size();i++){
		dat[i] *= mult;
	}
}
void clip(std::vector<float> &dat, float limit){
	for(int i=0;i<dat.size();i++){
		if(dat[i]>limit)dat[i]=limit;
		if(dat[i]<-limit)dat[i]=-limit;
	}
}
void volume(std::vector<float> &dat, float mul){
	for(int i=0;i<dat.size();i++){
		dat[i]*=mul;
	}
}

int main(int argc, char* argv[]){
	std::vector<float> outS;
	outS.reserve(reserved);
	std::map<std::string,std::vector<float> > soundMap;
	//load sound effects
	uint32_t sr;
	std::string a = "sounds/lvup.wav";
	soundMap["lvup"] = wavRead(a, sr);
	a = "sounds/upgrade.wav";
	soundMap["upgrade"] = wavRead(a, sr);
	a = "sounds/select.wav";
	soundMap["select"] = wavRead(a, sr);
	a = "sounds/beltPlace.wav";
	soundMap["beltPlace"] = wavRead(a, sr);
	a = "sounds/place.wav";
	soundMap["place"] = wavRead(a, sr);
	a = "sounds/del.wav";
	soundMap["del"] = wavRead(a, sr);
	//load file
	FILE* inF = fopen("sounds.txt","rb");
	fseek(inF, 0, SEEK_END);
	long fsize = ftell(inF);
	fseek(inF, 0, SEEK_SET);
	char* in = (char*)malloc(fsize + 1);
	fread(in, fsize, 1, inF);
	fclose(inF);
	in[fsize] = 0;
	//work though
	std::string txt(in);
	int32_t start=0;
	int32_t stop=-1;
	while(1){
		start = txt.find("\t",start+1);
		if(start==-1)break;
		float val = stof(txt.substr(stop+1,start));
		stop = txt.find("\n",start);
		if(stop==-1)break;
		std::string token = txt.substr(start+1,stop-start-2);
		//printf("%d,%d,%d,%s\n",start,stop,val,token.c_str());
		if(soundMap.count(token)!=0){
			soundAdd(soundMap[token],outS,(uint32_t)(val*735.f));
		}
	}
	volume(outS,0.4);
	//anticlip(outS,0.9);
	clip(outS,0.999);
	wavWrite("out.wav", outS, 44100);
}